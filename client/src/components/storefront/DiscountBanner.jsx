import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Tag, Percent, Clock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DiscountBanner = ({ discounts = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (discounts.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % discounts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [discounts.length, isPaused]);

  if (!discounts || discounts.length === 0) return null;

  const currentDiscount = discounts[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % discounts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + discounts.length) % discounts.length);
  };

  const getDiscountText = (discount) => {
    if (discount.type === 'percentage') {
      return `${discount.value}% OFF`;
    } else if (discount.type === 'fixed') {
      return `KSH ${discount.value} OFF`;
    } else if (discount.type === 'buy_x_get_y') {
      return 'SPECIAL OFFER';
    }
    return 'DISCOUNT';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-lg mb-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background Image with Enhanced Gradients */}
          <div 
            className="absolute inset-0 bg-cover bg-center transform scale-105"
            style={{
              backgroundImage: currentDiscount.seasonalDetails?.bannerImage
                ? `url(${currentDiscount.seasonalDetails.bannerImage})`
                : currentDiscount.products?.[0]?.image
                ? `url(${currentDiscount.products[0].image})`
                : currentDiscount.services?.[0]?.image
                ? `url(${currentDiscount.services[0].image})`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              filter: 'brightness(0.9) contrast(1.1)',
              transition: 'transform 0.5s ease-out'
            }}
          >
            {/* Multi-layer Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-blue-900/60 to-pink-900/40" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 via-transparent to-cyan-500/20" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center px-6 md:px-12">
            <div className="max-w-2xl space-y-4">
              {/* Seasonal Badge */}
              {currentDiscount.isSeasonalPromotion && currentDiscount.seasonalDetails?.seasonName && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge className="bg-yellow-500 text-black font-bold px-4 py-1 text-sm">
                    <Sparkles className="h-4 w-4 mr-1 inline" />
                    {currentDiscount.seasonalDetails.seasonName}
                  </Badge>
                </motion.div>
              )}

              {/* Discount Value with Enhanced Styling */}
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="flex items-center gap-4"
              >
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg blur-xl opacity-50 animate-pulse" />
                  {/* Main badge */}
                  <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-600 text-white px-6 py-3 rounded-lg shadow-2xl transform -rotate-2 border-2 border-white/20">
                    <p className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
                      {getDiscountText(currentDiscount)}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Title & Description with Text Effects */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-2xl" style={{
                  textShadow: '0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.2), 2px 2px 8px rgba(0,0,0,0.8)'
                }}>
                  {currentDiscount.seasonalDetails?.bannerText || currentDiscount.name}
                </h2>
                {currentDiscount.description && (
                  <p className="text-lg md:text-xl text-white/95 max-w-xl drop-shadow-lg font-medium">
                    {currentDiscount.description}
                  </p>
                )}
              </motion.div>

              {/* Validity & Code */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center gap-4 text-white"
              >
                {currentDiscount.code && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Tag className="h-4 w-4" />
                    <span className="font-mono font-bold">{currentDiscount.code}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    Valid until {formatDate(currentDiscount.validUntil)}
                  </span>
                </div>

                {currentDiscount.minPurchaseAmount > 0 && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Percent className="h-4 w-4" />
                    <span className="text-sm">
                      Min. KSH {currentDiscount.minPurchaseAmount}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Product/Service Preview with Enhanced Images */}
              {(currentDiscount.products?.length > 0 || currentDiscount.services?.length > 0) && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-3 mt-4"
                >
                  {currentDiscount.products?.slice(0, 3).map((product, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 + idx * 0.1, type: "spring" }}
                      className="relative group"
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl blur-md opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border-3 border-white shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  ))}
                  {currentDiscount.services?.slice(0, 3).map((service, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 + idx * 0.1, type: "spring" }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-red-500 rounded-xl blur-md opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border-3 border-white shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                        <img
                          src={service.image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200'}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Navigation Arrows */}
          {discounts.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all"
                aria-label="Previous banner"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all"
                aria-label="Next banner"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {discounts.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {discounts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'bg-white w-8'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to banner ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Floating Animation Elements */}
      <motion.div
        className="absolute top-10 right-10"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 15, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-300 rounded-full blur-xl opacity-50" />
          <Sparkles className="relative h-10 w-10 text-yellow-300 drop-shadow-lg" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-20"
        animate={{
          y: [0, -20, 0],
          rotate: [0, -15, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-pink-300 rounded-full blur-lg opacity-50" />
          <Sparkles className="relative h-7 w-7 text-pink-300 drop-shadow-lg" />
        </div>
      </motion.div>
      
      <motion.div
        className="absolute top-1/2 left-10"
        animate={{
          y: [0, -10, 0],
          x: [0, 5, 0],
          rotate: [0, 10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-blue-300 rounded-full blur-lg opacity-40" />
          <Sparkles className="relative h-6 w-6 text-blue-300 drop-shadow-lg" />
        </div>
      </motion.div>
    </div>
  );
};

export default DiscountBanner;
