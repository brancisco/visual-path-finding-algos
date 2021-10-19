import { Start, Finish, Wall, Open } from '@/graph'

export default class Dijkstra {
    constructor (graph) {
        this.graph = graph
        this.startNode = this.graph.getNodeBy('TYPE', Start)
        this.finishNode = this.graph.getNodeBy('TYPE', Finish)
        this.graph.qpush(this.startNode)
        this.pathFound = false
        this.path = []
    }

    isSame (n1, n2) {
        return n1.x === n2.x && n1.y === n2.y
    }

    reset () {
        this.graph.reset()
        this.startNode = this.graph.getNodeBy('TYPE', Start)
        this.finishNode = this.graph.getNodeBy('TYPE', Finish)
        this.graph.qpush(this.startNode)
        this.pathFound = false
        this.path = []
    }

    _manhattanDist (node) {
        return Math.sqrt(Math.pow(node.x - this.finishNode.x, 2) + Math.pow(node.y - this.finishNode.y, 2)) + 4
        // return Math.abs(node.x - this.finishNode.x, 2) + Math.abs(node.y - this.finishNode.y, 2)
    }

    step () {

        if (!this.pathFound) {
            const node = this.graph.qpop()
            if (node === null) return true 
            const neighbors = this.graph.getNeighbors(node.x, node.y)
            for (let neighbor of neighbors) {
                neighbor.node.visited = true
                neighbor.node.dist = node.dist + neighbor.dist
                neighbor.node.score = neighbor.node.dist + this._manhattanDist(neighbor.node)
                neighbor.node.prev = node
                this.graph.qpush(neighbor.node)
                if (this.isSame(neighbor.node, this.finishNode)) {
                    this.finishNode = neighbor.node
                    this.graph.queue.empty()
                    this.pathFound = true
                    this.path = this.getPath()
                    return false
                }
                
            }
            return false
        } else {
            let node = this.path.pop()
            if (!node) return true
            node.inpath = true
            return false
        }
        console.log('ERROR')
        return false
    }

    getPath () {
        if (this.finishNode.prev === null) return []
        let prev = this.finishNode.prev
        let path = [this.finishNode]
        while (prev) {
            path.push(prev)
            prev = prev.prev
        }
        return path
    }
}