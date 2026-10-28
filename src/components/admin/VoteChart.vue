<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps({
  paslons: { type: Array, required: true },
})

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']
const FONT = "'Poppins', sans-serif"

const chartData = computed(() => ({
  labels: props.paslons.map((p) => `Paslon ${p.nomor_urut}`),
  datasets: [
    {
      label: 'Jumlah Suara',
      data: props.paslons.map((p) => Number(p.suara) || 0),
      backgroundColor: COLORS,
      borderRadius: 12,
      borderSkipped: false,
      maxBarThickness: 110,
      barPercentage: 0.65,
      categoryPercentage: 0.75,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 450 },
  layout: { padding: { top: 15, right: 15, bottom: 5 } },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      padding: 12,
      displayColors: false,
      titleFont: { family: FONT, size: 13 },
      bodyFont: { family: FONT, size: 13 },
      callbacks: {
        label: (context) => `${context.parsed.y} suara`,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: '#334155', font: { family: FONT, size: 13, weight: 600 } },
      grid: { display: true, color: '#e2e8f0', drawBorder: false },
    },
    y: {
      beginAtZero: true,
      suggestedMax: 3,
      ticks: {
        precision: 0,
        color: '#64748b',
        font: { family: FONT, size: 12, weight: 500 },
      },
      grid: { display: true, color: '#e2e8f0', drawBorder: false },
    },
  },
}
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>
