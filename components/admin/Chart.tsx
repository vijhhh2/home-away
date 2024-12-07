'use client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const Chart = ({ data }: { data: { date: string, count: number }[] }) => {
  return (
    <section className="mt-24">
      <h1 className="text-4xl font-semibold txt-center">Monthly Bookings</h1>
      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={data} margin={{top: 50}}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='date' />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey='count' fill="#6d28d9" barSize={75} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}

export default Chart