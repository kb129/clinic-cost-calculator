import React, { useMemo, useState } from "react";
// --- minimal UI components (no external deps) ---
type DivProps = React.HTMLAttributes<HTMLDivElement>;
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

function Card({ className = "", ...rest }: DivProps) {
  return <div className={`rounded-2xl bg-white shadow ${className}`} {...rest} />;
}
function CardContent({ className = "", ...rest }: DivProps) {
  return <div className={`p-6 ${className}`} {...rest} />;
}
function Button({ className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 font-medium shadow bg-gray-900 text-white hover:opacity-90 disabled:opacity-50 ${className}`}
      {...rest}
    />
  );
}
function Input({ className = "", ...rest }: InputProps) {
  return (
    <input
      className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-gray-400 ${className}`}
      {...rest}
    />
  );
}
function Label({ className = "", ...rest }: LabelProps) {
  return <label className={`text-sm font-medium text-gray-700 ${className}`} {...rest} />;
}
//import { Card, CardContent } from "@/components/ui/card";
//import { Button } from "@/components/ui/button";
//import { Input } from "@/components/ui/input";
//import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { motion } from "framer-motion";

type Fees = { firstExam: number; reExam: number; others: number };

function price(betweenDays: number, totalDays: number, fees: Fees) {
  const nGo = Math.floor(totalDays / betweenDays);
  const perVisit = (betweenDays < 30 * 3 ? fees.reExam : fees.firstExam) + fees.others;
  return { total: perVisit * nGo, nGo };
}
// --- Domain logic (mirrors your Python) ---
export default function ClinicCostCalculator() {
  // Defaults based on your script
  const [totalDays, setTotalDays] = useState(365 * 6);
  const [maxInterval, setMaxInterval] = useState(120);
  const [step, setStep] = useState(1);
  const [baseMonths, setBaseMonths] = useState(3); // 3ヶ月の基準

  // Fees are multiplied by 3 like your Python (x3単位)
  const [fees, setFees] = useState({
    firstExam: 292, // 初診
    reExam: 80, // 再診
    others: (160 + 334 + 200), // その他
  });

  const baseDays = useMemo(() => baseMonths * 30, [baseMonths]);

  // break-even: (reExam + others) / (firstExam + others) * baseDays
  const equallyBd = useMemo(() => {
    const num = fees.reExam + fees.others;
    const den = fees.firstExam + fees.others;
    return (num / den) * baseDays;
  }, [fees, baseDays]);

  const data = useMemo(() => {
    const arr = [];
    for (let bd = step; bd <= maxInterval; bd += step) {
      const { total, nGo } = price(bd, totalDays, fees);
      arr.push({ interval: bd, total, visits: nGo });
    }
    return arr;
  }, [totalDays, maxInterval, step, fees]);

  const pointAtBreakEven = useMemo(() => {
    const { total } = price(equallyBd, totalDays, fees);
    return { x: equallyBd, y: total };
  }, [equallyBd, totalDays, fees]);
  const yAt20 = useMemo(() => {
    const point = data.find(d => d.interval === 20)
    return point ? point.total : 0
  }, [data])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-5xl space-y-6"
      >
        <h1 className="text-3xl font-bold tracking-tight">再診間隔コスト計算ツール</h1>
        <p className="text-gray-600">
          3ヶ月（{baseDays}日）より短い間隔では「再診料」、長い間隔では「初診料」がかかる前提で、
          総日数のあいだの累積費用を試算します。グラフでコストの変化とブレイクイーブン（等費用）ポイントを確認できます。
        </p>

        {/* Controls */}
        <Card className="shadow-sm">
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>総日数 (days)</Label>
              <Input
                type="number"
                min={1}
                value={totalDays}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotalDays(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>最大間隔 (days)</Label>
              <Input
                type="number"
                min={1}
                value={maxInterval}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxInterval(Number(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>刻み幅 (days)</Label>
              <Input
                type="number"
                min={1}
                value={step}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStep(Number(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label>基準月数（初診と再診の境目）</Label>
              <Input
                type="number"
                min={1}
                value={baseMonths}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBaseMonths(Number(e.target.value) || 1)}
              />
              <p className="text-xs text-gray-500">例: 3 → 90日</p>
            </div>

            {/* Fees */}
            <div className="space-y-2">
              <Label>初診料（合計）</Label>
              <Input
                type="number"
                min={0}
                value={fees.firstExam}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFees((f) => ({ ...f, firstExam: Number(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>再診料（合計）</Label>
              <Input
                type="number"
                min={0}
                value={fees.reExam}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFees((f) => ({ ...f, reExam: Number(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>その他（合計）</Label>
              <Input
                type="number"
                min={0}
                value={fees.others}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFees((f) => ({ ...f, others: Number(e.target.value) || 0 }))
                }
              />
            </div>

            <div className="md:col-span-3">
              <Button
                onClick={() => {
                  // no-op; React state updates drive the chart
                }}
                className="w-full"
              >
                計算を更新
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">等費用ポイント</div>
              <div className="text-2xl font-semibold">
                {equallyBd.toFixed(1)} 日ごと
              </div>
              <div className="text-sm text-gray-500">基準: {baseDays}日</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">等費用時の累積費用</div>
              <div className="text-2xl font-semibold">
                {pointAtBreakEven.y.toLocaleString()} 円
              </div>
              <div className="text-sm text-gray-500">総日数: {totalDays}日</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">試算範囲</div>
              <div className="text-2xl font-semibold">
                1 〜 {maxInterval} 日
              </div>
              <div className="text-sm text-gray-500">刻み: {step}日</div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="interval" label={{ value: "受診間隔（日）", position: "insideBottom", offset: -5 }} />
                  <YAxis
                    domain={[0, yAt20 || 'auto']}  // ←ここで固定
                    allowDataOverflow={true}      // ← これを入れる
                    tickFormatter={(v) => v.toLocaleString()}
                    label={{ value: "累積費用（円）", angle: -90, position: "insideLeft" }}
                    tickCount={6}   // 目盛りの数も調整可能
                  />
                  <Tooltip formatter={(value) => Number(value).toLocaleString()} labelFormatter={(l) => `${l} 日`} />
                  <Line type="monotone" dataKey="total" strokeWidth={2} dot={false} />
                  <ReferenceLine x={baseDays} strokeDasharray="5 5" />
                  <ReferenceDot x={pointAtBreakEven.x} y={pointAtBreakEven.y} r={5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              破線: 基準の {baseDays} 日（{baseMonths} ヶ月）。●: 等費用ポイント。
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <div className="text-xs text-gray-500">
          ※ 本ツールは概算の試算用です。実際の診療報酬や点数は制度変更・個別条件で異なる場合があります。
        </div>
      </motion.div>
    </div>
  );
}

