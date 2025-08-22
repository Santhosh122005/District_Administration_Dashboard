
// Chart.js configuration fixes and compatibility
document.addEventListener('DOMContentLoaded', function() {
    // Fix for horizontalBar chart type which is deprecated in Chart.js 3.x
    Chart.defaults.horizontalBar = {
        ...Chart.defaults.bar,
        indexAxis: 'y',
    };
    
    // Register custom plugin for responsive font sizes
    const responsiveFontPlugin = {
        id: 'responsiveFontPlugin',
        beforeDraw: function(chart) {
            const ctx = chart.ctx;
            const width = chart.width;
            const fontSize = Math.min(Math.round(width / 32), 16);
            
            ctx.font = fontSize + 'px sans-serif';
            chart.options.plugins.tooltip.bodyFont.size = fontSize;
            chart.options.plugins.tooltip.titleFont.size = fontSize + 2;
        }
    };
    
    Chart.register(responsiveFontPlugin);
});
