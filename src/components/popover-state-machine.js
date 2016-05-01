/**
 * A state machine for the popover state. In particular, this class manages the
 * mapping of parent nodes to their children, and translates touch events that
 * traverse various nodes to actions that are conditioned on whether a popover
 * is present.
 */

class PopoverStateMachine {
    constructor(handlers) {
        this.handlers = handlers;

        this.activePopover = null;
        this.popovers = {};
    }

    /**
     * Register a popover container as containing a set of children.
     *
     * @param {string} id - the identifier of the popover container
     * @param {string[]} childIds - the identifiers of the nodes contained in
     *                              the popover container
     */
    registerPopover(id, childIds) {
        this.popovers[id] = childIds;
    }

    /**
     * Unregister a popover container.
     *
     * @param {string} id - the identifier of the popover container to
     *                      unregister
     */
    unregisterPopover(id) {
        delete this.popovers[id];
    }

    /**
     * @returns {boolean} - whether a popover is active and visible
     */
    isPopoverVisible() {
        return this.activePopover != null;
    }

    /**
     * Blur the active nodes.
     */
    onBlur() {
        this.handlers.onActiveNodesChanged({
            popover: null,
            focus: null,
        });
    }

    /**
     * Handle a focus event on the node with the given identifier.
     *
     * @param {string} id - the identifier of the node that was focused
     */
    onFocus(id) {
        if (this.activePopover) {
            // If we have a popover that is currently active, we focus this
            // node if and only if it's in the popover.
            if (this._isNodeInsidePopover(this.activePopover, id)) {
                this.handlers.onActiveNodesChanged({
                    popover: this.activePopover,
                    focus: id,
                });
            }
        } else if (this.popovers[id]) {
            // If we're newly focusing a popover, enable it and auto-focus its
            // first child.
            // NOTE(charlie): There's an assumption here that focusing the
            // first child is the correct behavior for a newly focused popover.
            // This relies on the fact that the children are rendered
            // bottom-up. If that rendering changes, this logic will need to
            // change as well.
            this.activePopover = id;
            this.handlers.onActiveNodesChanged({
                popover: this.activePopover,
                focus: this._defaultNodeForPopover(this.activePopover),
            });
        } else {
            this.activePopover = null;
            this.handlers.onActiveNodesChanged({
                popover: null,
                focus: id,
            });
        }
    }

    /**
     * Handle a touch-end event on the node with the given identifier.
     *
     * @param {string} id - the identifier of the node over which the touch
     *                      ended
     */
    onTouchEnd(id) {
        if (this.activePopover) {
            // If we have a popover that is currently active, we trigger a
            // click on this node if and only if it's in the popover.
            if (this._isNodeInsidePopover(this.activePopover, id)) {
                this.handlers.onClick(id, id);
            }
        } else if (this.popovers[id]) {
            // Otherwise, if the node is itself a popover revealer, trigger the
            // clicking of its default node, but pass back the popover node ID
            // for layout purposes.
            const keyId = this._defaultNodeForPopover(id);
            const domNodeId = id;
            this.handlers.onClick(keyId, domNodeId);
        } else if (id != null) {
            // Finally, if we have no active popover, and we touched up over a
            // valid key, trigger a click.
            this.handlers.onClick(id, id);
        }

        this.activePopover = null;
        this.onBlur();
    }

    _isNodeInsidePopover(popover, id) {
        return this.popovers[popover].includes(id);
    }

    _defaultNodeForPopover(popover) {
        return this.popovers[popover][0];
    }
}

module.exports = PopoverStateMachine;
