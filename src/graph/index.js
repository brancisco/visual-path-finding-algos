import PriorityQueue from '@/PriorityQueue'
import FifoQueue from '@/FifoQueue'
class Tile {}

export class Start extends Tile {}

export class Finish extends Tile {}

export class Wall extends Tile {}

export class Open extends Tile {}

export class Node {
    constructor (x, y) {
        this.x = x
        this.y = y
        this.visited = false
        this.queued = false
        this.prev = null
        this.dist = Number.POSITIVE_INFINITY
        this.score = Number.POSITIVE_INFINITY
        this.type = Open
        this.inpath = false
    }
}

export class Graph {
    constructor (nodes=[], queueType=FifoQueue) {
        this.nodes = nodes
        this.visited = []
        this.unvisited = []
        this.nodes.forEach(node => {
            if (node.type === Start) {
                node.dist = 0
                this.visited.push(node)
            }
            else this.unvisited.push(node)
        })
        this.queueType = queueType
        if (this.queueType === FifoQueue) {
            this.queue = new FifoQueue()
        }
        else if (this.queueType === PriorityQueue) {
            this.queue = new PriorityQueue
            this.queue._getter = function (i) {
                return this.heap[i].score
            }
        }
        this.diagonal = true
    }

    reset () {
        for (let node of this.nodes) {
            node.visited = false
            node.queued = false
            node.prev = null
            node.dist = Number.POSITIVE_INFINITY
            node.score = Number.POSITIVE_INFINITY
            node.inpath = false
            node.type = node.type === Wall ? Open : node.type
        }
        this.visited = []
        this.unvisited = []
        this.nodes.forEach(node => {
            if (node.type === Start) {
                node.dist = 0
                this.visited.push(node)
            }
            else this.unvisited.push(node)
        })
        if (this.queueType === FifoQueue) {
            this.queue = new FifoQueue()
        }
        else if (this.queueType === PriorityQueue) {
            this.queue = new PriorityQueue
            this.queue._getter = function (i) {
                return this.heap[i].score
            }
        }
    }

    nodeUpdate () {
        this.visited = []
        this.unvisited = []
        this.nodes.forEach(node => {
            if (node.type === Start) this.visited.push(node)
            else this.unvisited.push(node)
        })
    }

    getNodeBy (by) {
        if (by === 'POSITION') {
            let [x, y, unvisited] = Object.values(arguments).slice(1, 3)
            unvisited = unvisited ? true : false
            return this.nodes.find(node => node.x === x && node.y === y && (!unvisited || !node.visited))
        } else if (by === 'TYPE') {
            const type = arguments[1]
            return this.nodes.find(node => node.type === type)
        }
    }

    isLRNeighbor (x, y, node) {
        let nums = [1, -1]
        return (nums.map(n => n + x).includes(node.x) && y == node.y) ||
               (nums.map(n => n + y).includes(node.y) && x === node.x)
    }

    isDiagonalNeighbor (x, y, node) {
        let nums = [1, -1]
        return (nums.map(n => n + x).includes(node.x) && nums.map(n => n + y).includes(node.y)) ||
               (nums.map(n => n + y).includes(node.y) && nums.map(n => n + x).includes(node.x))
    }

    isNeighbor (x, y, node) {
        if (node.type === Wall) return -1
        if (this.isLRNeighbor(x, y, node)) {
            return 1
        }
        if (this.diagonal) {
            if (this.isDiagonalNeighbor(x, y, node)) {
                return 1.4142135624
            }
        }
        return -1
    }

    getNeighbors (x, y, markAsVisited=true) {
        let neighbors = []
        let unvisited = []
        this.unvisited.forEach(node => {
            let dist = this.isNeighbor(x, y, node)
            if (dist >= 0) {
                if (markAsVisited) {
                    node.visited = true
                    this.visited.push(node)
                }
                neighbors.push({ node, dist })
            } else {
                unvisited.push(node)
            }
        })
        if (markAsVisited) {
            this.unvisited = unvisited
        }
        
        return neighbors.sort((a, b) => {
            return a.dist > b.dist ? 1 : -1
        })
    }

    setStartNode (x, y) {
        let old = this.getNodeBy('TYPE', Start)
        if (old) {
            old.visited = false
            old.dist = Number.POSITIVE_INFINITY
            old.type = Open
            old.queued = false
        }
        let node = this.getNodeBy('POSITION', x, y)
        node.visited = true
        node.dist = 0
        node.type = Start
    }

    setFinishNode (x, y) {
        let old = this.getNodeBy('TYPE', Finish)
        if (old) {
            old.type = Open
        }
        let node = this.getNodeBy('POSITION', x, y)
        node.type = Finish
        this.reset()
    }

    setNodeType (x, y, type) {
        let node = this.getNodeBy('POSITION', x, y)
        node.type = type
        this.reset()
    }

    push (node) {
        this.nodes.push(node)
        this.reset()
    }

    qpush (node) {
        node.queued = true
        this.queue.insert(node)
    }

    qpop () {
        const node = this.queue.pop()
        if (node) node.queued = false
        return node
    }

    getNodes () {
        // NOTE: this needs to be sorted for svg css animation to work correctly
        return [...this.unvisited, ...this.visited].sort((a, b) => {
            let n = a.x - b.x
            if (n !== 0) {
                return n
            }

            return a.y - b.y
        })
    }

}