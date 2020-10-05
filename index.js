let page_title = 'Number of Ratings 2016 - 2020'

d3.select('head').append('title').text(page_title)

let body = d3.select('body')

body.attr('onload', 'main()')

async function get_boardgame_ratings_data() {
    return await d3.csv('boardgame_ratings.csv', d => {
        d.date = new Date(d.date)
        d['Catan=count'] = +d['Catan=count']
        d['Catan=rank'] = +d['Catan=rank']
        d['Codenames=count'] = +d['Codenames=count']
        d['Codenames=rank'] = +d['Codenames=rank']
        d['Dixit=count'] = +d['Dixit=count']
        d['Dixit=rank'] = +d['Dixit=rank']
        d['Dominion=count'] = +d['Dominion=count']
        d['Dominion=rank'] = +d['Dominion=rank']
        d['Gloomhaven=count'] = +d['Gloomhaven=count']
        d['Gloomhaven=rank'] = +d['Gloomhaven=rank']
        d['Magic: The Gathering=count'] = +d['Magic: The Gathering=count']
        d['Magic: The Gathering=rank'] = +d['Magic: The Gathering=rank']
        d['Monopoly=count'] = +d['Monopoly=count']
        d['Monopoly=rank'] = +d['Monopoly=rank']
        d['Terraforming Mars=count'] = +d['Terraforming Mars=count']
        d['Terraforming Mars=rank'] = +d['Terraforming Mars=rank']
        return d
    })
}

function deltaDate(input, days, months, years) {
    return new Date(
      input.getFullYear() + years,
      input.getMonth() + months,
      Math.min(
        input.getDate() + days,
        new Date(input.getFullYear() + years, input.getMonth() + months + 1, 0).getDate()
      )
    )
}

let redux = (array, term, allowed) => array.map(
    o => allowed.reduce(
        (acc, curr) => {
            if (curr.includes(term)) {
                acc[curr.replace(term, '')] = o[curr]
            } else {acc[curr] = o[curr]}
            return acc
        },
        {}
    )
)

function pivot(data) {
    let iter = function(pivoted, record) {
        for (let key in record) {
            if (!pivoted[key]) pivoted[key] = []
            pivoted[key].push(record[key])
        }
    return pivoted
    }
  return data.reduce(iter, {})
}

async function main() {
    let data = await get_boardgame_ratings_data()

    let games = data.columns
        .filter(name => name.includes('=count'))
        .map(d => { return d.replace('=count', '') })

    const count_columns = data.columns.filter(name => /=count|date/.test(name))
    const rank_columns = data.columns.filter(name => /=rank|date/.test(name))

    let pivoted = pivot(data)
    console.log(pivoted)

    let counts = redux(data, '=count', count_columns)
    let ranks = redux(data, '=rank', rank_columns)

    let n = data.length

    let margin = {top: 75, right: 75, bottom: 75, left: 85}
    let width = 1425  - margin.left - margin.right
    let height = 800 - margin.top - margin.bottom

    let svg = body.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

    let xScale = d3.scaleTime()
        .domain([
            d3.min(data, d => { return deltaDate(new Date(d.date), 0, -1, 0)}),
            d3.max(data, d => { return deltaDate(new Date(d.date), 0, 1, 0) })
        ])
        .range([0, width])

    const getArrayMax = array => array.reduce((a, b) => Math.max(a, b))
    const range_max = counts
        .map((obj) => Object.values(obj).slice(1, 9))
        .reduce((acc, el) => acc.map((max, i) => Math.max(max, el[i])), [0, 0, 0, 0, 0, 0, 0, 0])

    const range = (start, stop, step = 1) => Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)

    let y_max = Math.ceil(getArrayMax(range_max)/10000) * 10000

    let yValues = range(0, y_max + 20000, 20000)

    let yScale = d3.scaleLinear()
        .domain([0, y_max])
        .range([height, 50])

    let color = d3.scaleOrdinal(d3.schemeTableau10)

    let interval = 3

    let dateRange = (start, end, range = []) => {
        if (start > end) return range
        const next = deltaDate(start, 0, interval, 0)
        return dateRange(next, end, [...range, start])
    }

    let max_date = d3.max(data, d => { return deltaDate(new Date(d.date), 0, 1, 0) })

    let min_date = d3.min(data, d => { return d.date})

    let xValues = dateRange(min_date, max_date)

    let formatTime = d3.timeFormat('%b %y')

    let xAxis = d3.axisBottom()
        .scale(xScale).tickFormat(formatTime).tickValues(xValues).tickPadding(10).tickSize(2)

    let yAxis = d3.axisLeft().tickFormat(d3.format(".2s")).tickValues(yValues).tickPadding(10)
        .scale(yScale).tickSize(-width)

    let line_Cat = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d['Catan']); })
        .curve(d3.curveMonotoneX)

    let line_Cod = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d['Codenames']); })
        .curve(d3.curveMonotoneX)

    let line_Dix = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d['Dixit']); })
        .curve(d3.curveMonotoneX)

    let line_Dom = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d['Dominion']); })
        .curve(d3.curveMonotoneX)

    let line_Glo = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d['Gloomhaven']); })
        .curve(d3.curveMonotoneX)

    let line_Mag = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d['Magic: The Gathering']); })
        .curve(d3.curveMonotoneX)

    let line_Mon = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d['Monopoly']); })
        .curve(d3.curveMonotoneX)

    let line_Ter = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d['Terraforming Mars']); })
        .curve(d3.curveMonotoneX)

    let main_g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    main_g.append('g').attr("class", "y axis").call(yAxis)
    main_g.append('g').attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis)

    main_g.append('text')
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -55)
        .attr("x", (-height-50)/2)
        .text("Number of Ratings")
        .attr('class', 'y label')

    main_g.append('text')
        .attr("text-anchor", "middle")
        .attr("y", height + 60)
        .attr("x", width/2)
        .text("Month")
        .attr('class', 'x label')

    main_g.append('text')
        .attr("text-anchor", "start")
        .attr("y", -15)
        .attr("x", -50)
        .text(page_title)
        .attr('class', 'header')

    let legend = main_g.append('g').attr("class", "legend").attr("transform", "translate(0," + 25 + ")")

    legend.append('text')
        .attr("text-anchor", "end")
        .attr("x", 1265)
        .text('Terraforming Mars')
        .attr('class', 'Terraforming')
        .style('font-family', '\'Montserrat\', sans-serif')

    legend.append('rect')
        .attr('x', 1088)
        .attr('y', -15)
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', '#ff9da7')



    legend.append('text')
        .attr("text-anchor", "end")
        .attr("x", 1060)
        .text('Monopoly')
        .attr('class', 'Monopoly')
        .style('font-family', '\'Montserrat\', sans-serif')

    legend.append('rect')
        .attr('x', 950)
        .attr('y', -15)
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', '#b07aa1')

    legend.append('text')
        .attr("text-anchor", "end")
        .attr("x", 925)
        .text('Magic')
        .attr('class', 'Magic')
        .style('font-family', '\'Montserrat\', sans-serif')

    legend.append('rect')
        .attr('x', 847)
        .attr('y', -15)
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', '#edc948')

    legend.append('text')
        .attr("text-anchor", "end")
        .attr("x", 820)
        .text('Gloomhaven')
        .attr('class', 'Gloomhaven')
        .style('font-family', '\'Montserrat\', sans-serif')

    legend.append('rect')
        .attr('x', 690)
        .attr('y', -15)
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', '#59a14f')

    legend.append('text')
        .attr("text-anchor", "end")
        .attr("x", 660)
        .text('Dominion')
        .attr('class', 'Dominion')
        .style('font-family', '\'Montserrat\', sans-serif')

    legend.append('rect')
        .attr('x', 550)
        .attr('y', -15)
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', '#76b7b2')

    legend.append('text')
        .attr("text-anchor", "end")
        .attr("x", 520)
        .text('Dixit')
        .attr('class', 'Dixit')
        .style('font-family', '\'Montserrat\', sans-serif')

    legend.append('rect')
        .attr('x', 455)
        .attr('y', -15)
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', '#e15759')

    legend.append('text')
        .attr("text-anchor", "end")
        .attr("x", 420)
        .text('Codenames')
        .attr('class', 'Codenames')
        .style('font-family', '\'Montserrat\', sans-serif')

    legend.append('rect')
        .attr('x', 295)
        .attr('y', -15)
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', '#f28e2b')

    legend.append('text')
        .attr("text-anchor", "end")
        .attr("x", 265)
        .text('Catan')
        .attr('class', 'Catan')
        .style('font-family', '\'Montserrat\', sans-serif')

    legend.append('rect')
        .attr('x', 190)
        .attr('y', -15)
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', '#4e79a7')

    main_g.append("path")
        .style("stroke", '#4e79a7')
        .style('fill', 'None')
        .datum(counts)
        .attr("class", "chart line")
        .attr("d", line_Cat)

    main_g.append("path")
        .style("stroke", '#f28e2b')
        .style('fill', 'None')
        .datum(counts)
        .attr("class", "chart line")
        .attr("d", line_Cod)

    main_g.append("path")
        .style("stroke", '#e15759')
        .style('fill', 'None')
        .datum(counts)
        .attr("class", "chart line")
        .attr("d", line_Dix)

    main_g.append("path")
        .style("stroke", '#76b7b2')
        .style('fill', 'None')
        .datum(counts)
        .attr("class", "chart line")
        .attr("d", line_Dom)

    main_g.append("path")
        .style("stroke", '#59a14f')
        .style('fill', 'None')
        .datum(counts)
        .attr("class", "chart line")
        .attr("d", line_Glo)

    main_g.append("path")
        .style("stroke", '#edc948')
        .style('fill', 'None')
        .datum(counts)
        .attr("class", "chart line")
        .attr("d", line_Mag)

    main_g.append("path")
        .style("stroke", '#b07aa1')
        .style('fill', 'None')
        .datum(counts)
        .attr("class", "chart line")
        .attr("d", line_Mon)

    main_g.append("path")
        .style("stroke", '#ff9da7')
        .style('fill', 'None')
        .datum(counts)
        .attr("class", "chart line")
        .attr("d", line_Ter)

}
