'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import {
  ShoppingBag,
  Tag,
  Heart,
  Smartphone,
  Plus,
  Home,
  TrendingUp,
  Activity,
  Check,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

// Chart data
const chartData = [
  { name: 'Mon', value: 2400 },
  { name: 'Tue', value: 3200 },
  { name: 'Wed', value: 2800 },
  { name: 'Thu', value: 4100 },
  { name: 'Fri', value: 3800 },
  { name: 'Sat', value: 5200 },
  { name: 'Sun', value: 4800 },
]

// Industries data
const industries = [
  { icon: ShoppingBag, name: 'E-commerce' },
  { icon: Tag, name: 'Fashion & Apparel' },
  { icon: Heart, name: 'Beauty & Cosmetics' },
  { icon: Smartphone, name: 'Technology & SaaS' },
  { icon: Plus, name: 'Health & Wellness' },
  { icon: Home, name: 'Home & Lifestyle' },
]

// Platforms
const platforms = [
  { name: 'Google Ads', color: '#4285F4' },
  { name: 'Meta Ads', color: '#1877F2' },
  { name: 'TikTok Ads', color: '#000000' },
  { name: 'LinkedIn', color: '#0A66C2' },
  { name: 'Amazon Ads', color: '#FF9900' },
  { name: 'Snapchat', color: '#FFFC00' },
]

// Industry icons for avatar group
const industryIcons = [
  { bg: '#3B82F6', icon: ShoppingBag },
  { bg: '#8B5CF6', icon: Tag },
  { bg: '#EC4899', icon: Heart },
  { bg: '#10B981', icon: Smartphone },
]

const brandLogos = [
  { bg: '#F97316', letter: 'N' },
  { bg: '#06B6D4', letter: 'A' },
  { bg: '#8B5CF6', letter: 'S' },
  { bg: '#EF4444', letter: 'T' },
]

const industryImages = {
  'E-commerce': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
  'Fashion & Apparel': 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80',
  'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
  'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'Health & Wellness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
}

export default function BentoGridSection() {
  const [activeTab, setActiveTab] = useState<'monthly' | 'daily'>('monthly')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('Fashion & Apparel')
  const { ref: chartRef, inView: chartInView } = useInView({ triggerOnce: true, threshold: 0.3 })
  const { ref: countRef, inView: countInView } = useInView({ triggerOnce: true, threshold: 0.5 })

  return (
    <section className="py-20 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Proven Results Across Industries
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From fashion to tech, we've helped brands scale their advertising and drive real growth
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
          
          {/* ROW 1 */}
          {/* Left: Main Feature Card - Full Image with Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 lg:row-span-2 relative rounded-3xl overflow-hidden group cursor-pointer h-[500px]"
          >
            <motion.img
              key={selectedIndustry}
              src={industryImages[selectedIndustry as keyof typeof industryImages]}
              alt={selectedIndustry}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
              {/* Top Badge */}
              <div>
                <span className="inline-block px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/20">
                  Industries I've Worked With
                </span>
              </div>
              
              {/* Bottom Content */}
              <div>
                <h3 className="text-3xl font-bold text-white mb-3">
                  Scaling Brands<br />Across Industries
                </h3>
                <p className="text-sm text-white/80 mb-5 max-w-[320px]">
                  From fashion to tech, I've helped 50+ brands achieve exceptional growth through performance marketing.
                </p>
                
                {/* Industry Tags */}
                <div className="flex flex-wrap gap-2">
                  <motion.span
                    onClick={() => setSelectedIndustry('E-commerce')}
                    className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/10 cursor-pointer hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    E-commerce
                  </motion.span>
                  <motion.span
                    onClick={() => setSelectedIndustry('Fashion & Apparel')}
                    className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/10 cursor-pointer hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Fashion & Apparel
                  </motion.span>
                  <motion.span
                    onClick={() => setSelectedIndustry('Beauty')}
                    className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/10 cursor-pointer hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Beauty
                  </motion.span>
                  <motion.span
                    onClick={() => setSelectedIndustry('Technology')}
                    className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/10 cursor-pointer hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Technology
                  </motion.span>
                  <motion.span
                    onClick={() => setSelectedIndustry('Health & Wellness')}
                    className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/10 cursor-pointer hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Health & Wellness
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Middle: Dashboard Card */}
          <motion.div
            ref={chartRef}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-4 bg-white rounded-3xl p-5 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Live Performance</h3>
                <p className="text-xs text-gray-500">Real-time metrics</p>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab('monthly')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setActiveTab('daily')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    activeTab === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Daily
                </button>
              </div>
            </div>
            <div className="h-[80px] mb-3" style={{ minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#chartGradient)"
                    animationDuration={chartInView ? 1500 : 0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-600">Ad Spend Today</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-900">$2,450</span>
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                </div>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-600">Active Campaigns</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-900">12</span>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-600">Avg CTR</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-900">3.2%</span>
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Revenue + Industries - Combined */}
          <div className="lg:col-span-3 space-y-4">
            {/* Revenue Metric */}
            <motion.div
              ref={countRef}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm relative overflow-hidden"
            >
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
                }}
              />
              <div className="relative text-center py-2">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium mb-3">
                  Total Generated
                </span>
                <div className="text-3xl font-bold text-gray-900">
                  ${countInView ? <CountUp end={5.2} decimals={1} duration={2} /> : '0.0'}M+
                </div>
                <p className="text-xs text-gray-500 mt-1">In client revenue</p>
              </div>
            </motion.div>

            {/* Industries List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm"
            >
              <h3 className="text-base font-bold text-gray-900 mb-3">Industries</h3>
              <div className="space-y-1">
                {industries.map((industry, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <industry.icon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-600">{industry.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ROW 2 */}
          {/* Left: Beauty/Cosmetics Image Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-5 relative rounded-3xl overflow-hidden group cursor-pointer h-[220px]"
          >
            <img
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80"
              alt="Beauty Products"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white mb-2">
                Beauty & Cosmetics
              </span>
              <h3 className="text-lg font-bold text-white mb-1">Beauty Brands</h3>
              <p className="text-sm text-white/80">Scaled 30+ beauty brands with 5x+ ROAS</p>
            </div>
          </motion.div>

          {/* Middle: Team + Platforms */}
          <div className="lg:col-span-4 space-y-4">
            {/* Team/Clients Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-3xl p-5 border border-gray-200"
              style={{ backgroundColor: '#F8F9FF' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Industries Served</span>
                <span className="text-xs text-blue-600 font-medium">+4</span>
              </div>
              <div className="flex -space-x-2 mb-4">
                {industryIcons.map((item, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white"
                    style={{ backgroundColor: item.bg, zIndex: industryIcons.length - index }}
                  >
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-gray-200/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Brand Partners</span>
                  <span className="text-xs text-blue-600 font-medium">+12</span>
                </div>
                <div className="flex -space-x-2">
                  {brandLogos.map((item, index) => (
                    <div
                      key={index}
                      className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white text-white font-bold text-sm"
                      style={{ backgroundColor: item.bg, zIndex: brandLogos.length - index }}
                    >
                      {item.letter}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Platforms Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm"
            >
              <h3 className="text-base font-bold text-gray-900 mb-1">Marketing Platforms</h3>
              <p className="text-xs text-gray-500 mb-3">Expert in all major ad platforms</p>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((platform, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: platform.color }}
                    />
                    <span className="text-xs font-medium text-gray-700">{platform.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Sneakers Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="lg:col-span-3 relative rounded-3xl overflow-hidden group cursor-pointer h-[220px]"
          >
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
              alt="Premium Sneakers"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                  Footwear
                </span>
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
              <p className="text-sm text-white/90">28+ successful launches</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
