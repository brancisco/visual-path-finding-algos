import { Start, Finish, Wall, Open } from '@/graph'

export default class Dijkstra {
    constructor (graph, heuristicName) {
        this.graph = graph
        this.heuristic = this.setHeuristic(heuristicName)
        this.startNode = this.graph.getNodeBy('TYPE', Start)
        this.finishNode = this.graph.getNodeBy('TYPE', Finish)
        this.pathFound = false
        this.path = []
        this.pathIndex = 0
        console.log(this.graph.queue)
    }

    setHeuristic (heuristicName) {
        if (heuristicName === 'euclidean') {
            return (node) => {
                return Math.sqrt(Math.pow(node.x - this.finishNode.x, 2) + Math.pow(node.y - this.finishNode.y, 2))
            }
        } else if (heuristicName === 'manhattan') {
            return (node) => {
                return Math.abs(node.x - this.finishNode.x, 2) + Math.abs(node.y - this.finishNode.y, 2)
            }
        }
    }

    isSame (n1, n2) {
        return n1.x === n2.x && n1.y === n2.y
    }

    reset () {
        this.graph.reset()
        this.startNode = this.graph.getNodeBy('TYPE', Start)
        this.finishNode = this.graph.getNodeBy('TYPE', Finish)
        this.graph.nodes.forEach(node => this.graph.qpush(node))
        this.pathFound = false
        this.path = []
        this.pathIndex = 0
        console.log(this.graph.queue)
    }

    step () {
        if (!this.pathFound) {
            const node = this.graph.qpop()
            this.graph.visited.push(node)
            node.visited = true
            if (node === null) return true 
            const neighbors = this.graph.getNeighbors(node.x, node.y)
            for (let neighbor of neighbors) {
                let newdist = node.dist + neighbor.dist
                if (newdist < neighbor.node.dist) {
                    neighbor.node.dist = newdist
                    neighbor.node.score = neighbor.node.dist + this.heuristic(neighbor.node)
                    neighbor.node.prev = node
                }
                if (this.isSame(neighbor.node, this.finishNode)) {
                    this.finishNode = neighbor.node
                    // this.graph.queue.empty()
                    this.pathFound = true
                    this.path = this.getPath()
                    return false
                }
            }
            this.graph.queue._heapify()
            return false
        } else {
            let node = this.path[this.path.length - 1 - this.pathIndex]
            this.pathIndex ++
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