import * as d3 from "d3"
import Dijkstra from '@/algo/dijkstra'
import PriorityQueue from '@/PriorityQueue'
import FifoQueue from '@/FifoQueue'
import { Node, Graph, Start, Finish, Wall, Open } from '@/graph'

import css from '@/assets/main.css'

// define any constants
const ROWS = 11
const COLS = 25
const SPACE = 600 / COLS
const RADIUS = SPACE / 3
const TIME = 20
const COLORFN = d3.interpolateRgbBasis(['#FC427B', '#FFFFFF', '#EAB543'])

// intialize any global vars
var play = false
var dragging = false
var selecting = 0
var algo = 'dijkstra'
var startpos = [4, 5]
var finishpos = [20, 5]
var fps = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

// get the app element
var app = document.getElementById('app')

// create buttons
const playbutton = document.getElementById('play-button')
playbutton.innerHTML = 'Play'
playbutton.onclick = function () {
    play = !play
    playbutton.innerHTML = play ? 'Pause' : 'Play'
    playAnimation(TIME)
}

const resetbutton = document.getElementById('reset-button')
resetbutton.innerHTML = 'Reset'
resetbutton.onclick = function () {
    play = false
    playbutton.innerHTML = play ? 'Pause' : 'Play'
    dijkstra = initAlgorithm(algo)
    animate()
}

const setNodeButton = document.getElementById('set-goals-button')
setNodeButton.innerHTML = 'Set Goals'
setNodeButton.onclick = function () {
    play = false
    playbutton.innerHTML = play ? 'Pause' : 'Play'
    dijkstra = initAlgorithm(algo)
    animate()
    selecting = 2
    this.classList.toggle('selecting-start-node')
    this.innerHTML = 'Set Start'
}

// create selects
const algoSelector = document.getElementById('select-algo')
algoSelector.onchange = function () { 
    algo = this.value
    dijkstra = initAlgorithm(algo)
}

const fpsDisplay = document.getElementById('fps-meter')
fpsDisplay.innerHTML = 0

const tipDisplay = document.getElementById('tip')
tipDisplay.appendChild((() => {
    let tip = document.createElement('p')
    tip.innerHTML = 'Click a node and drag to add walls.'
    return tip
})())

function initAlgorithm (algorithmName) {
    // initialize the graph
    var graph = new Graph([], algorithmName)
    for (let i = 0; i < ROWS; i ++) {
        for (let j = 0; j < COLS; j ++) {
            graph.push(new Node(j, i))
        }
    }
    graph.setStartNode(...startpos)
    graph.setFinishNode(...finishpos)

    // initialize the dijkstra algo stepper
    return new Dijkstra(graph)
}

var dijkstra = initAlgorithm(algo)

function playAnimation (time) {
    const start = performance.now()
    animate()
    if (dijkstra.step()) {
        play = false
        playbutton.innerHTML = 'Replay'
        dijkstra.reset()
        return
    }
    if (play) {
        setTimeout(function () {
            fps.push(1 / ((performance.now() - start) / 1000))
            fps.splice(0, 1)
            let avgfps = Math.round(fps.reduce((acc, cur) => acc + cur, 0) / 10)
            fpsDisplay.innerHTML = avgfps
            playAnimation(TIME)
        }, time);
    }
}

var d3app = d3.select('#svg-container')

const svg = d3app.append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 0 600 300')
    .attr('class', 'responsive-svg')
    .on('touchstart touchend', handleTouch)

const glines = svg.append('g')
const g = svg.append('g')


function dragHandler (etype, event, selected) {
    if (play === true) return
    if (etype === 'start' && selecting) {
        const node = event.subject
        if (selecting === 2) {
            console.log(setNodeButton)
            setNodeButton.classList.toggle('selecting-start-node')
            setNodeButton.classList.toggle('selecting-end-node')
            setNodeButton.innerHTML = 'Set Finish'
            startpos = [node.x, node.y]
            dijkstra.graph.setStartNode(node.x, node.y)
        }
        else if (selecting === 1) {
            setNodeButton.classList.toggle('selecting-end-node')
            setNodeButton.innerHTML = 'Set Goals'
            finishpos = [node.x, node.y]
            dijkstra.graph.setFinishNode(node.x, node.y)
        }
        dijkstra.reset()
        animate()
        selecting --;
    }
    else if (etype === 'end') dragging = false
    else dragging = true
}

function mouseover (event, node) {
    if (dragging && !node.visited && node.type === Open) {
        node.type = Wall
        node.queued = false
        animate()
    }
}

// Touch is janky, should try to make it better
function handleTouch (event, node) {
    event.preventDefault()
    if ('touchstart' === event.type) {
        dragging = true
    } else if ('touchend' === event.type) {
        dragging = false
    }
    if (['pointerenter', 'pointerout'].includes(event.type) && dragging && !node.visited && node.type === Open) {
        node.type = Wall
        animate()
    }
}

var drag = d3.drag()
    .on('start',function (event) { dragHandler('start', event, d3.select(this)) })
    .on('drag',function (event) { dragHandler('drag', event) })
    .on('end',function (event) { dragHandler('end', event, d3.select(this)) })

function animate () {
    g.selectAll('circle')
        .data(dijkstra.graph.getNodes())
        .join('circle')
            .attr('cx', (node) => 5 + RADIUS + node.x*SPACE)
            .attr('cy', (node) => 5 + RADIUS + node.y*SPACE)
            .attr('r', RADIUS)
            .classed('visited', (node) => node.visited)
            .classed('queued', (node) => node.dist < Number.POSITIVE_INFINITY)
            .classed('inpath', (node) => node.inpath)
            .classed('wall', (node) => node.type === Wall)
            .classed('open', (node) => node.type === Open &&
                                       !node.visited &&
                                       !node.queued &&
                                       !node.inpath
            )
            .attr("fill", (node, i) => {
                if (node.type === Start)
                    return '#EAB543'
                else if (node.type === Finish)
                    return '#FC427B'
                else if (node.type === Wall)
                    return '#BDC581'
                else if (node.inpath)
                    return '#1B9CFC'
                else if (node.visited)
                    return '#9AECDB'
                else if (node.dist < Number.POSITIVE_INFINITY)
                    return '#D6A2E8'
                else return '#b2bec3'
            })
            .call(drag)
            .on('mouseenter', mouseover)
            .on('mouseout', mouseover)
            .on('pointerenter pointerout', handleTouch)
            
    glines.selectAll('line')
        .data(dijkstra.graph.getNodes())
        .join('line')
            .attr('x1', (node) => 5 + RADIUS + node.x*SPACE)
            .attr('y1', (node) => 5 + RADIUS + node.y*SPACE)
            .attr('x2', (node) => 5 + RADIUS + (node.prev ? node.prev.x : node.x)*SPACE)
            .attr('y2', (node) => 5 + RADIUS + (node.prev ? node.prev.y : node.y)*SPACE)
            .attr('stroke-width', (node) => {
                if (node.inpath && node.prev && node.prev.inpath) {
                    return 3
                }
                return 1
            })
            .attr('stroke', (node) => {
                if (node.inpath && node.prev && node.prev.inpath) {
                    const ind = dijkstra.path.findIndex(n => n.x === node.x && n.y === node.y)
                    return COLORFN(ind/dijkstra.path.length)
                }
                return 'white'
            })
}

animate()