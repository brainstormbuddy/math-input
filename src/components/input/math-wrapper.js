/**
 * This file contains a wrapper around MathQuill so that we can provide a
 * more regular interface for the functionality we need while insulating us
 * from MathQuill changes.
 */

const $ = require('jquery');
// TODO(kevinb) allow test code to use const MathQuill = require('mathquill');
const MathQuill = window.MathQuill;

const Keys = require('../../data/keys');
const CursorContexts = require('./cursor-contexts');
const { FractionBehaviorTypes } = require('../../consts');

const WRITE = 'write';
const CMD = 'cmd';
const MQ_END = 0;

// A mapping from keys that can be pressed on a keypad to the way in which
// MathQuill should modify its input in response to that key-press. Any keys
// that do not provide explicit actions (like the numeral keys) will merely
// write their contents to MathQuill.
const KeyActions = {
    [Keys.PLUS]: { str: '+', fn: WRITE },
    [Keys.MINUS]: { str: '-', fn: WRITE },
    [Keys.TIMES]: { str: '\\times', fn: WRITE },
    [Keys.DIVIDE]: { str: '\\div', fn: WRITE },
    [Keys.DECIMAL]: { str: '.', fn: WRITE },
    [Keys.EQUAL]: { str: '=', fn: WRITE },
    [Keys.NEQ]: { str: '\\neq', fn: WRITE },
    [Keys.CDOT]: { str: '\\cdot', fn: WRITE },
    [Keys.PERCENT]: { str: '%', fn: WRITE },
    [Keys.SQRT]: { str: 'sqrt', fn: CMD },
    [Keys.PI]: { str: 'pi', fn: CMD },
    [Keys.THETA]: { str: 'theta', fn: CMD },
    [Keys.RADICAL]: { str: 'nthroot', fn: CMD },
    [Keys.LT]: { str: '<', fn: WRITE },
    [Keys.LEQ]: { str: '\\leq', fn: WRITE },
    [Keys.GT]: { str: '>', fn: WRITE },
    [Keys.GEQ]: { str: '\\geq', fn: WRITE },
};

const NormalCommands = {
    [Keys.LOG]: 'log',
    [Keys.LN]: 'ln',
    [Keys.SIN]: 'sin',
    [Keys.COS]: 'cos',
    [Keys.TAN]: 'tan',
};

const ArithmeticOperators = ['+', '-', '\\cdot', '\\times', '\\div'];
const EqualityOperators = ['=', '\\neq', '<', '\\leq', '>', '\\geq'];

class MathWrapper {

    constructor(element, options = {}, callbacks = {}) {
        const { fractionBehavior } = options;
        this.fractionBehavior = fractionBehavior ||
            FractionBehaviorTypes.INCLUSIVE;

        this.MQ = MathQuill.getInterface(2);
        this.mathField = this.MQ.MathField(element, {
            // use a span instead of a textarea so that we don't bring up the
            // native keyboard on mobile when selecting the input
            substituteTextarea: function() {
                return document.createElement('span');
            },
        });
        this.callbacks = callbacks;
    }

    focus() {
        // HACK(charlie): We shouldn't reaching into MathQuill internals like
        // this, but it's the easiest way to allow us to manage the focus state
        // ourselves.
        const controller = this.mathField.__controller;
        controller.cursor.show();

        // Set MathQuill's internal state to reflect the focus, otherwise it
        // will consistently try to hide the cursor on key-press and introduce
        // layout jank.
        controller.blurred = false;
    }

    blur() {
        const controller = this.mathField.__controller;
        controller.cursor.hide();
        controller.blurred = true;
    }

    _writeNormalFunction(name) {
        this.mathField.write(`\\${name}\\left(\\right)`);
        this.mathField.keystroke('Left');
    }

    /**
     * Handle a key press and return the resulting cursor state.
     *
     * @param {Key} key - an enum representing the key that was pressed
     * @returns {object} a cursor object, consisting of a cursor context
     */
    pressKey(key) {
        const cursor = this.mathField.__controller.cursor;

        if (key in KeyActions) {
            const {str, fn} = KeyActions[key];

            if (str && fn) {
                this.mathField[fn](str);
            }
        } else if (key === Keys.FRAC) {
            if (this.fractionBehavior === FractionBehaviorTypes.INCLUSIVE) {
                this.mathField.cmd('/');
            } else {
                this.mathField.cmd('\\frac');
            }
        } else if (key === Keys.PARENS) {
            this.mathField.write('\\left(\\right)');
            this.mathField.keystroke('Left');
        } else if (Object.keys(NormalCommands).includes(key)) {
            this._writeNormalFunction(NormalCommands[key]);
        } else if (key === Keys.LOG_N) {
            this.mathField.write('log_{ }\\left(\\right)');
            this.mathField.keystroke('Left'); // into parentheses
            this.mathField.keystroke('Left'); // out of parentheses
            this.mathField.keystroke('Left'); // into index
        } else if (key === Keys.CUBE_ROOT) {
            this.mathField.write('\\sqrt[3]{}');
            this.mathField.keystroke('Left'); // under the root
        } else if (key === Keys.EXP || key === Keys.EXP_2 ||
                key === Keys.EXP_3) {
            this._handleExponent(cursor, key);
        } else if (key === Keys.TOGGLE_SIGN) {
            this._handleToggleSign(cursor);
        } else if (key === Keys.BACKSPACE) {
            this._handleBackspace(cursor);
        } else if (key === Keys.LEFT) {
            this._handleLeftArrow(cursor);
        } else if (key === Keys.RIGHT || key === Keys.JUMP_OUT) {
            this._handleRightArrow(cursor);
        } else if (/^[a-zA-Z]$/.test(key)) {
            this.mathField[WRITE](key);
        } else if (/^NUM_\d/.test(key)) {
            this.mathField[WRITE](key[4]);
        }

        if (!cursor.selection) {  // don't show the cursor for selections
            cursor.show();
        }

        if (this.callbacks.onSelectionChanged) {
            this.callbacks.onSelectionChanged(cursor.selection);
        }

        // NOTE(charlie): It's insufficient to do this as an `edited` handler
        // on the MathField, as that handler isn't triggered on navigation
        // events.
        return {
            context: this._contextForCursor(cursor),
        };
    }

    /**
     * Place the cursor beside the node located at the given coordinates.
     *
     * @param {number} x - the x coordinate in the viewport
     * @param {number} y - the y coordinate in the viewport
     * @param {Node} hitNode - the node next to which the cursor should be
     *                         placed; if provided, the coordinates will be used
     *                         to determine on which side of the node the cursor
     *                         should be placed
     */
    setCursorPosition(x, y, hitNode) {
        const el = hitNode || document.elementFromPoint(x, y);

        if (el) {
            const cursor = this.getCursor();

            if (el.hasAttribute('mq-root-block')) {
                // If we're in the empty area place the cursor at the right
                // end of the expression.
                cursor.insAtRightEnd(this.mathField.__controller.root);
            } else {
                // Otherwise place beside the element at x, y.
                const controller = this.mathField.__controller;

                const pageX = x - document.body.scrollLeft;
                const pageY = y - document.body.scrollTop;
                controller.seek($(el), pageX, pageY).cursor.startSelection();

                // Unless that would leave us mid-command, in which case, we
                // need to adjust and place the cursor inside the parens
                // following the command.
                const command = this._maybeFindCommand(cursor[this.MQ.L]);
                if (command && command.endNode) {
                    // NOTE(charlie): endNode should definitely be \left(.
                    cursor.insLeftOf(command.endNode);
                    this.mathField.keystroke('Right');
                }
            }

            if (this.callbacks.onCursorMove) {
                this.callbacks.onCursorMove({
                    context: this._contextForCursor(cursor),
                });
            }
        }
    }

    getCursor() {
        return this.mathField.__controller.cursor;
    }

    getSelection() {
        return this.getCursor().selection;
    }

    getContent() {
        return this.mathField.latex();
    }

    setContent(latex) {
        this.mathField.latex(latex);
    }

    isEmpty() {
        const cursor = this.getCursor();
        return cursor.parent.id === 1 && cursor[1] === 0 && cursor[-1] === 0;
    }

    // Notes about MathQuill
    //
    // MathQuill's stores its layout as nested linked lists.  Each node in the
    // list has this.MQ.L '-1' and this.MQ.R '1' properties that define links to
    // the left and right nodes respectively.  They also have
    //
    // ctrlSeq: contains the latex code snippet that defines that node.
    // jQ: jQuery object for the DOM node(s) for this MathQuill node.
    // ends: pointers to the nodes at the ends of the container.
    // parent: parent node.
    // blocks: an array containing one or more nodes that make up the node.
    // sub?: subscript node if there is one as is the case in log_n
    //
    // All of the code below is super fragile.  Please be especially careful
    // when upgrading MathQuill.

    /**
     * Selects and deletes part of the expression based on the cursor location.
     * See inline comments for precise behavior of different cases.
     *
     * @param {cursor} cursor
     * @private
     */
    _handleBackspace(cursor) {
        if (!cursor.selection) {
            const parent = cursor.parent;
            const grandparent = parent.parent;
            const leftNode = cursor[this.MQ.L];

            if (this._isFraction(leftNode)) {
                this._selectNode(leftNode, cursor);

            } else if (this._isSquareRoot(leftNode)) {
                this._selectNode(leftNode, cursor);

            } else if (this._isNthRoot(leftNode)) {
                this._selectNode(leftNode, cursor);

            } else if (this._isNthRootIndex(parent)) {
                this._handleBackspaceInRootIndex(cursor);

            } else if (leftNode.ctrlSeq === '\\left(') {
                this._handleBackspaceOutsideParens(cursor);

            } else if (grandparent.ctrlSeq === '\\left(') {
                this._handleBackspaceInsideParens(cursor);

            } else if (this._isInsideLogIndex(cursor)) {
                this._handleBackspaceInLogIndex(cursor);

            } else if (leftNode.ctrlSeq === '\\ge ' ||
                    leftNode.ctrlSeq === '\\le ') {
                this._handleBackspaceAfterLigaturedSymbol(cursor);

            } else {
                this.mathField.keystroke('Backspace');
            }
        } else {
            this.mathField.keystroke('Backspace');
        }
    }

    _handleLeftArrow(cursor) {
        // If we're inside a function, and just after the left parentheses, we
        // need to skip the entire function name, rather than move the cursor
        // inside of it. For example, when hitting left from within the
        // parentheses in `cos()`, we want to place the cursor to the left of
        // the entire expression, rather than between the `s` and the left
        // parenthesis.
        // From the cursor's perspective, this requires that our left node is
        // the MQ_END node, that our grandparent is the left parenthesis, and
        // the nodes to the left of our grandparent comprise a valid function
        // name.
        if (cursor[this.MQ.L] === MQ_END) {
            const parent = cursor.parent;
            const grandparent = parent.parent;
            if (grandparent.ctrlSeq === '\\left(') {
                const command = this._maybeFindCommandBeforeParens(grandparent);
                if (command) {
                    cursor.insLeftOf(command.startNode);
                    return;
                }
            }
        }

        // Otherwise, we default to the standard MathQull left behavior.
        this.mathField.keystroke('Left');
    }

    _handleRightArrow(cursor) {
        const command = this._maybeFindCommand(cursor[this.MQ.R]);
        if (command) {
            // Similarly, if a function is to our right, then we need to place
            // the cursor at the start of its parenthetical content, which is
            // done by putting it to the left of ites parentheses and then
            // moving right once.
            cursor.insLeftOf(command.endNode);
            this.mathField.keystroke('Right');
        } else {
            // Otherwise, we default to the standard MathQull right behavior.
            this.mathField.keystroke('Right');
        }
    }

    _handleExponent(cursor, key) {
        // If there's an invalid operator preceding the cursor (anything that
        // knowingly cannot be raised to a power), add an empty set of
        // parentheses and apply the exponent to that.
        const invalidPrefixes = [...ArithmeticOperators, ...EqualityOperators];

        const precedingNode = cursor[this.MQ.L];
        const shouldPrefixWithParens = precedingNode === MQ_END ||
                invalidPrefixes.includes(precedingNode.ctrlSeq.trim());
        if (shouldPrefixWithParens) {
            this.mathField.write('\\left(\\right)');
        }

        // Insert the appropriate exponent operator.
        switch (key) {
            case Keys.EXP:
                this.mathField.cmd('^');
                break;

            case Keys.EXP_2:
            case Keys.EXP_3:
                this.mathField.write(`^${key === Keys.EXP_2 ? 2 : 3}`);

                // If we enter a square or a cube, we should leave the cursor
                // within the newly inserted parens, if they exist. This takes
                // exactly four left strokes, since the cursor by default would
                // end up to the right of the exponent.
                if (shouldPrefixWithParens) {
                    this.mathField.keystroke('Left');
                    this.mathField.keystroke('Left');
                    this.mathField.keystroke('Left');
                    this.mathField.keystroke('Left');
                }
                break;

            default:
                throw new Error(`Invalid exponent key: ${key}`);
        }
    }

    /**
     * Return the start node, end node, and full name of the command of which
     * the initial node is a part, or `null` if the node is not part of a
     * command.
     *
     * @param {node} initialNode - the node to included as part of the command
     * @returns {null|object} - `null` or an object containing the start node
     *                          (`startNode`), end node (`endNode`), and full
     *                          name (`name`) of the command
     * @private
     */
    _maybeFindCommand(initialNode) {
        if (!initialNode) {
            return null;
        }

        // MathQuill stores commands as separate characters so that
        // users can delete commands one character at a time.  We iterate over
        // the nodes from right to left until we hit a sequence starting with a
        // '\\', which signifies the start of a command; then we iterate from
        // left to right until we hit a '\\left(', which signifies the end of a
        // command.  If we encounter any character that doesn't belong in a
        // command, we return null.  We match a single character at a time.
        // Ex) ['\\l', 'o', 'g ', '\\left(', ...]
        const commandCharRegex = /^[a-z]$/;
        const commandStartRegex = /^\\[a-z]$/;
        const commandEndSeq = '\\left(';

        // Note: We whitelist the set of valid commands, since relying solely on
        // a command being prefixed with a backslash leads to undesired
        // behavior. For example, Greek symbols, left parentheses, and square
        // roots all get treated as commands.
        const validCommands = ['\\log', '\\ln', '\\cos', '\\sin', '\\tan'];

        let name = '';
        let startNode;
        let endNode;

        // Collect the portion of the command from the current node, leftwards
        // until the start of the command.
        let node = initialNode;
        while (node !== 0) {
            const ctrlSeq = node.ctrlSeq.trim();
            if (commandCharRegex.test(ctrlSeq)) {
                name = ctrlSeq + name;
            } else if (commandStartRegex.test(ctrlSeq)) {
                name = ctrlSeq + name;
                startNode = node;
                break;
            } else {
                break;
            }

            node = node[this.MQ.L];
        }

        // If we hit the start of a command, then grab the rest of it by
        // iterating rightwards to compute the full name of the command, along
        // with its terminal node.
        if (startNode) {
            // Next, iterate from the start to the right.
            node = initialNode[this.MQ.R];
            while (node !== 0) {
                const ctrlSeq = node.ctrlSeq.trim();
                if (commandCharRegex.test(ctrlSeq)) {
                    // If we have a single character, add it to the command
                    // name.
                    name = name + ctrlSeq;
                } else if (ctrlSeq === commandEndSeq)  {
                    // If we hit the command end delimiter (the left
                    // parentheses surrounding its arguments), stop.
                    endNode = node;
                    break;
                }

                node = node[this.MQ.R];
            }
            if (validCommands.includes(name)) {
                return { name, startNode, endNode };
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    /**
     * Return the start node, end node, and full name of the command to the left
     * of `\\left(`, or `null` if there is no command.
     *
     * @param {node} leftParenNode - node where .ctrlSeq == `\\left(`
     * @returns {null|object} - `null` or an object containing the start node
     *                          (`startNode`), end node (`endNode`), and full
     *                          name (`name`) of the command
     * @private
     */
    _maybeFindCommandBeforeParens(leftParenNode) {
        return this._maybeFindCommand(leftParenNode[this.MQ.L]);
    }

    _selectNode(node, cursor) {
        cursor.insLeftOf(node);
        cursor.startSelection();
        cursor.insRightOf(node);
        cursor.select();
        cursor.endSelection();
    }

    _isFraction(node) {
        return node.jQ && node.jQ.hasClass('mq-fraction');
    }

    _isSquareRoot(node) {
        return node.blocks && node.blocks[0].jQ &&
            node.blocks[0].jQ.hasClass('mq-sqrt-stem');
    }

    _isNthRoot(node) {
        return node.blocks && node.blocks[0].jQ &&
            node.blocks[0].jQ.hasClass('mq-nthroot');
    }

    _isNthRootIndex(node) {
        return node.jQ && node.jQ.hasClass('mq-nthroot');
    }

    _isInsideLogIndex(cursor) {
        const grandparent = cursor.parent.parent;

        if (grandparent && grandparent.jQ.hasClass('mq-supsub')) {
            const command = this._maybeFindCommandBeforeParens(grandparent);

            if (command && command.name === '\\log') {
                return true;
            }
        }

        return false;
    }

    _isInsideEmptyNode(cursor) {
        return cursor[this.MQ.L] === MQ_END && cursor[this.MQ.R] === MQ_END;
    }

    _handleBackspaceInRootIndex(cursor) {
        if (this._isInsideEmptyNode(cursor)) {
            // When deleting the index in a nthroot, we change from the nthroot
            // to a sqrt, e.g. \sqrt[|]{35x-5} => |\sqrt{35x-5}.  If there's no
            // content under the root, then we delete the whole thing.

            const grandparent = cursor.parent.parent;
            const latex = grandparent.latex();
            const reinsertionPoint = grandparent[this.MQ.L];

            this._selectNode(grandparent, cursor);

            const rootIsEmpty = grandparent.blocks[1].jQ.text() === '';

            if (rootIsEmpty) {
                // If there is not content under the root then simply delete
                // the whole thing.
                this.mathField.keystroke('Backspace');
            } else {
                // Replace the nthroot with a sqrt if there was content under
                // the root.

                // Start by deleting the selection.
                this.mathField.keystroke('Backspace');

                // Replace the nth-root with a sqrt.
                this.mathField.write(
                    latex.replace(/^\\sqrt\[\]/, '\\sqrt'));

                // Adjust the cursor to be to the left the sqrt.
                if (reinsertionPoint === MQ_END) {
                    this.mathField.moveToDirEnd(this.MQ.L);
                } else {
                    cursor.insRightOf(reinsertionPoint);
                }
            }
        } else {
            if (cursor[this.MQ.L] !== MQ_END) {
                // If the cursor is not at the leftmost position inside the
                // root's index, delete a character.
                this.mathField.keystroke('Backspace');
            } else {
                // TODO(kevinb) verify that we want this behavior after testing
                // Do nothing because we haven't completely deleted the
                // index of the radical.
            }
        }
    }

    _handleBackspaceInLogIndex(cursor) {
        if (this._isInsideEmptyNode(cursor)) {
            const grandparent = cursor.parent.parent;
            const command = this._maybeFindCommandBeforeParens(grandparent);

            cursor.insLeftOf(command.startNode);
            cursor.startSelection();

            if (grandparent[this.MQ.R] !== MQ_END) {
                cursor.insRightOf(grandparent[this.MQ.R]);
            } else {
                cursor.insRightOf(grandparent);
            }

            cursor.select();
            cursor.endSelection();

            const isLogBodyEmpty =
                grandparent[this.MQ.R].contentjQ.text() === '';

            if (isLogBodyEmpty) {
                // If there's no content inside the log's parens then delete the
                // whole thing.
                this.mathField.keystroke('Backspace');
            }
        } else {
            this.mathField.keystroke('Backspace');
        }
    }

    _handleBackspaceOutsideParens(cursor) {
        // In this case the node with '\\left(' for its ctrlSeq
        // is the parent of the expression contained within the
        // parentheses.
        //
        // Handle selecting an expression before deleting:
        // (x+1)| => |(x+1)|
        // \log(x+1)| => |\log(x+1)|

        const leftNode = cursor[this.MQ.L];
        const rightNode = cursor[this.MQ.R];
        const command = this._maybeFindCommandBeforeParens(leftNode);

        if (command && command.startNode) {
            // There's a command before the parens so we select it as well as
            // the parens.
            cursor.insLeftOf(command.startNode);
            cursor.startSelection();
            if (rightNode === MQ_END) {
                cursor.insAtRightEnd(cursor.parent);
            } else {
                cursor.insLeftOf(rightNode);
            }
            cursor.select();
            cursor.endSelection();
        } else {
            cursor.startSelection();
            cursor.insLeftOf(leftNode); // left of \\left(
            cursor.select();
            cursor.endSelection();
        }
    }

    _handleBackspaceInsideParens(cursor) {
        // Handle situations when the cursor is inside parens or a
        // command that uses parens, e.g. \log() or \tan()
        //
        // MathQuill represents log(x+1) in roughly the following way
        // [l, o, g, \\left[parent:[x, +, 1]]]
        //
        // If the cursor is inside the parentheses it's next to one of:
        // x, +, or 1.  This makes sub_sub_expr its parent and sub_expr
        // it's parent.
        //
        // Interestingly parent doesn't have any nodes to the left or
        // right of it (even though the corresponding DOM node has
        // ( and ) characters on either side.
        //
        // The grandparent's ctrlSeq is `\\left(`. The `\\right)` isn't
        // stored anywhere.  NOTE(kevinb): I believe this is because
        // MathQuill knows what the close paren should be and does the
        // right thing at render time.
        //
        // This conditional branch handles the following cases:
        // - \log(x+1|) => \log(x+|)
        // - \log(|x+1) => |\log(x+1)|
        // - \log(|) => |

        if (cursor[this.MQ.L] !== MQ_END) {
            // This command contains math and there's some math to
            // the left of the cursor that we should delete normally
            // before doing anything special.
            this.mathField.keystroke('Backspace');
            return;
        }

        const grandparent = cursor.parent.parent;

        // If the cursors is inside the parens at the start but the command
        // has a subscript as is the case in log_n then move the cursor into
        // the subscript, e.g. \log_{5}(|x+1) => \log_{5|}(x+1)

        if (grandparent[this.MQ.L].sub) {  // if there is a subscript
            if (grandparent[this.MQ.L].sub.jQ.text()) {  // and it contains text
                // move the cursor to the right end of the subscript
                cursor.insAtRightEnd(grandparent[this.MQ.L].sub);
                return;
            }
        }

        // Determine if the parens are empty before we modify the
        // cursor's position.
        const isEmpty = this._isInsideEmptyNode(cursor);

        // Insert the cursor to the left of the command if there is one
        // or before the '\\left(` if there isn't
        const command = this._maybeFindCommandBeforeParens(grandparent);

        cursor.insLeftOf((command && command.startNode) || grandparent);
        cursor.startSelection();
        cursor.insRightOf(grandparent);
        cursor.select();
        cursor.endSelection();

        // Delete the selection, but only if the parens were empty to
        // begin with.
        if (isEmpty) {
            this.mathField.keystroke('Backspace');
        }
    }

    /**
     * Handle the 'toggle sign' operation.
     *
     * This implementation makes non-trivial assumptions about the behavior of
     * our keypads. Namely, it assumes that the 'toggle sign' operation can
     * only be performed on keypads that will never have selection states, and
     * will never have nested expressions.
     */
    _handleToggleSign(cursor) {
        // Pre-compute a few values before mutating the cursor.
        const leftNode = cursor[this.MQ.L];
        const parent = cursor.parent;
        const isAtTopLevel = this._isAtTopLevel(cursor);

        // Store the selection, if it exists.
        const leftEnd = cursor.selection && cursor.selection.ends[this.MQ.L];
        const rightEnd = cursor.selection && cursor.selection.ends[this.MQ.R];

        const latex = this.getContent();
        const minusSign = '-';
        if (latex.charAt(0) === minusSign) {
            // If the input is leading with a minus sign, remove it.
            this.mathField.moveToDirEnd(this.MQ.L);
            this.mathField.keystroke('Right');
            this.mathField.keystroke('Backspace');
        } else {
            // Otherwise, write it at the start of the expression.
            this.mathField.moveToDirEnd(this.MQ.L);
            this.mathField.write(minusSign);
        }

        // If you had something selected, restore it.
        if (leftEnd && rightEnd) {
            cursor.insLeftOf(leftEnd);
            cursor.startSelection();
            cursor.insRightOf(rightEnd);
            cursor.select();
            cursor.endSelection();
        } if (leftNode === MQ_END && !isAtTopLevel) {
            // Otherwise, if we started in an empty, non-top-level node (like an
            // empty numerator), then we need to re-insert into the end of that
            // node.
            cursor.insAtLeftEnd(parent);
        } else if (leftNode !== MQ_END && leftNode.latex() !== minusSign) {
            // Finally, if our cursor wasn't at the start of the expression and
            // wasn't at the minus sign (in such cases, it would naturally be in
            // the right place after insertion), re-insert it.
            cursor.insRightOf(leftNode);
        }
    }

    _handleBackspaceAfterLigaturedSymbol(cursor) {
        this.mathField.keystroke('Backspace');
        this.mathField.keystroke('Backspace');
    }

    _contextForCursor(cursor) {
        if (this._isAtTopLevel(cursor)) {
            if (this._isInsideEmptyNode(cursor)) {
                return CursorContexts.EMPTY;
            } else if (cursor[this.MQ.L] === MQ_END) {
                return CursorContexts.LEFT_END;
            } else if (cursor[this.MQ.R] === MQ_END) {
                return CursorContexts.RIGHT_END;
            } else {
                return CursorContexts.TOP_LEVEL;
            }
        } else {
            return CursorContexts.NESTED;
        }
    }

    _isAtTopLevel(cursor) {
        return !cursor.parent.parent;
    }
}

module.exports = MathWrapper;
