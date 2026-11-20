import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface SupplierData {
  name: string;
  code: string;
  hotel_count: number;
  sightseeing_count: number;
  reliability_score: number;
}

export const SupplierDistributionChart: React.FC<{ data: SupplierData[] }> = ({ data }) => {
  const chartData = data.map(d => ({
    name: d.code || d.name,
    Hotels: d.hotel_count,
    Sightseeing: d.sightseeing_count,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EAE3D9" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#77716A', fontSize: 11 }} />
          <YAxis tick={{ fill: '#77716A', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#EAE3D9',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(41,37,31,0.06)',
              fontSize: '11px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Bar dataKey="Hotels" fill="#B58A5A" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Sightseeing" fill="#D2B48C" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const InventoryCategoryPieChart: React.FC<{ hotels: number; sightseeing: number }> = ({ hotels, sightseeing }) => {
  const pieData = [
    { name: 'Hotels', value: hotels || 500, color: '#B58A5A' },
    { name: 'Sightseeing & Tours', value: sightseeing || 300, color: '#D2B48C' },
  ];

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={4}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#EAE3D9',
              borderRadius: '8px',
              fontSize: '11px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MatchingConfidenceChart: React.FC = () => {
  const confidenceData = [
    { range: '95–100% (Strong)', count: 1263, fill: '#348568' },
    { range: '85–94% (Possible)', count: 680, fill: '#B58A5A' },
    { range: '75–84% (Review)', count: 566, fill: '#D69A43' },
    { range: '<75% (Separate)', count: 320, fill: '#D96C62' },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={confidenceData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EAE3D9" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#77716A', fontSize: 11 }} />
          <YAxis type="category" dataKey="range" tick={{ fill: '#77716A', fontSize: 10 }} width={110} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#EAE3D9',
              borderRadius: '8px',
              fontSize: '11px',
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {confidenceData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
