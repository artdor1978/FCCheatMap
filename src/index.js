import * as d3 from "d3";
import * as styles from "../styles/index.css";

let app = () => {
	const chart = d3.select("body").append("svg").attr("id", "chart");
	const legendContainer = chart.append("g").attr("id", "legend");
	const url =
		"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
	const getData = async () => {
		const data = await d3.json(url);
		renderChart(data);
	};
	const renderChart = (data) => {
		const areaWidth = window.innerWidth;
		const areaHeight = window.innerHeight;
		const areaPadding = areaHeight * 0.1;
		chart.attr("width", areaWidth).attr("height", areaHeight);
		const tempVariance = d3.extent(
			data.monthlyVariance,
			(d) => data.baseTemperature + d.variance
		);
		const color = d3
			.scaleQuantize()
			.domain(tempVariance)
			.range([
				"#3288bd",
				"#99d594",
				"#e6f598",
				"#fee08b",
				"#fc8d59",
				"#d53e4f",
			]);

		const tooltip = d3
			.select("body")
			.append("div")
			.attr("id", "tooltip")
			.style("opacity", 0);
		chart
			.append("text")
			.text("Monthly Global Land-Surface Temperature")
			.attr("x", areaWidth / 2)
			.attr("y", areaPadding - 20)
			.attr("id", "title")
			.attr("text-anchor", "middle")
			.style("fill", "#006fbe");
		chart
			.append("text")
			.attr("x", areaWidth / 2)
			.attr("y", areaPadding - 20)
			.attr("text-anchor", "middle")
			.attr("id", "description")
			.attr("dy", "1.5em")
			.html(
				data.monthlyVariance[0].year +
					" -" +
					data.monthlyVariance[data.monthlyVariance.length - 1].year +
					" base temperature: " +
					data.baseTemperature +
					"&#8451;"
			)
			.style("fill", "#006fbe");
		const y = d3
			.scaleBand()
			.domain(d3.range(1, 13))
			.rangeRound([areaPadding, areaHeight - areaPadding]);
		const yAxis = d3.axisLeft(y).tickFormat((d) => {
			const dddd = new Date();
			dddd.setUTCMonth(d - 1);
			return d3.timeFormat("%B")(dddd);
		});
		chart
			.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + areaPadding + ",0)")
			.attr("id", "y-axis")
			.call(yAxis);
		const x = d3
			.scaleBand()
			.domain(data.monthlyVariance.map((d) => d.year))
			.paddingOuter(0.1)
			.range([areaPadding, areaWidth - areaPadding]);
		const xAxis = d3
			.axisBottom(x)
			.tickValues(
				d3.range(
					data.monthlyVariance[0].year,
					data.monthlyVariance[data.monthlyVariance.length - 1].year,
					10
				)
			)
			.tickFormat(d3.format("d"));
		chart
			.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + (areaHeight - areaPadding) + ")")
			.attr("id", "x-axis")
			.call(xAxis);
		chart
			.selectAll("rect")
			.data(data.monthlyVariance)
			.enter()
			.append("rect")
			.attr("class", "cell")
			.attr("x", (d, i) => x(d.year))
			.attr("y", (d) => y(d.month))
			.attr("width", x.bandwidth())
			.attr("height", y.bandwidth())
			.attr("fill", (d) => color(data.baseTemperature + d.variance))
			.attr("data-month", (d) => d.month - 1)
			.attr("data-year", (d) => d.year)
			.attr("data-temp", (d) => data.baseTemperature + d.variance)
			.on("mouseover", (d, i) => {
				const dm = new Date();
				dm.setUTCMonth(i.month - 1);
				tooltip.transition().duration(200).style("opacity", 1);
				tooltip
					.html(
						i.year +
							"<br/>" +
							d3.timeFormat("%B")(dm) +
							"<br/>" +
							(data.baseTemperature + i.variance).toFixed(2) +
							" " +
							"&#8451;"
					)
					.style("left", event.pageX - 25 + "px")
					.style("top", event.pageY - 45 + "px")
					.attr("data-year", i.year);
			})
			.on("mouseout", function (d) {
				tooltip.transition().duration(500).style("opacity", 0);
			});
		console.log(tempVariance, color.range().length);
		console.log(d3.range(tempVariance[0], tempVariance[1], color.length));
		const legend = legendContainer
			.selectAll("#legend")
			.data(color.range())
			.enter()
			.append("g")
			.attr("class", "legend-label")
			.attr("transform", function (d, i) {
				return "translate(0," + (areaHeight - areaPadding / 1.5) + ")";
			});
		legend
			.append("rect")
			.attr("x", (d, i) => areaPadding + i * 40 + 20)
			.attr("width", 40)
			.attr("height", 20)
			.style("fill", (d) => d);
		legendContainer
			.selectAll("text")
			.data(
				d3.range(
					tempVariance[0],
					tempVariance[1],
					(tempVariance[1] - tempVariance[0]) / color.range().length
				)
			)
			.enter()
			.append("text")
			.text((d) => d.toFixed(2))
			.attr("transform", function (d, i) {
				return "translate(0," + (areaHeight - areaPadding / 1.5 + 30) + ")";
			})
			.attr("x", (d, i) => areaPadding + i * 40 + 20)
			.style("fill", "#006fbe");
	};
	return getData();
};

const root = document.querySelector("#root");
root.appendChild(app());
