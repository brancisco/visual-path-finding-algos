export default class PriorityQueue {
    constructor (mode='MIN') {
        this.mode = mode
        this.heap = []
        this._compareFunction = this._getCompareFunction()
    }

    pop () {
        if (!this.heap.length) return null
        this._swap(this.heap, 0, this.heap.length - 1)
        const max = this.heap.pop()
        this._heapify()
        return max
    }

    peek () {
        if (this.heap.length) return this.heap[0]
        return null
    }

    insert (item) {
        this.heap.push(item)
        if (this.heap.length > 1) this._heapify()
    }

    empty () {
        this.heap = []
    }

    _getter (i) {
        return this.heap[i]
    }

    _swap (arr, i, j) {
        let temp = arr[i]
        arr[i] = arr[j]
        arr[j] = temp
    }

    _getParentIndex (i) {
        if (i === 0) return null
        const index = Math.ceil(i / 2) - 1
        return index
    }

    _heapify () {
        const end = this.heap.length - 1
        if (end <= 0) return;
        for (let i = Math.ceil((end - 1) / 2); i >= 0; i--) {
            this._siftDown(i, end)
        }

    }

    _getCompareFunction () {
        if (this.mode === 'MIN')
            return (l, r) => l < r
        else if (this.mode === 'MAX')
            return (l, r) => l > r
        else
            throw new Error('Mode must be MIN or MAX')
    }

    _siftDown (i, end) {
        let root = i
        while (root * 2 + 1 <= end) {
            const l = root * 2 + 1
            const r = l + 1
            let child = l
            if (r <= end && !this._compareFunction(this._getter(l), this._getter(r))) {
                child = r
            }
            if (this._compareFunction(this._getter(child), this._getter(root))) {
                this._swap(this.heap, child, root)
                root = child
            } else {
                return
            }
        }
    }
}