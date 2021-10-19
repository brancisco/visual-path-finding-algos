export default class FifoQueue {
    constructor () {
        this.queue = []
    }

    insert (item) {
        this.queue.push(item)
    }

    pop () {
        const value = this.queue.splice(0, 1)
        return value.length < 1 ? null : value[0]
    }

    peek () {
        return this.queue[0]
    }

    empty () {
        this.queue = []
    }
}