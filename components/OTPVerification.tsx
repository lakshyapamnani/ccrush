'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface OTPVerificationProps {
  email: string
  onVerify: (otp: string) => void
  onResend: () => void
  error?: string
}

export default function OTPVerification({
  email,
  onVerify,
  onResend,
  error = '',
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else {
      setCanResend(true)
      if (interval) clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timeLeft])

  const handleOTPChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')

    if (numericValue.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = numericValue

      if (numericValue && index < 5) {
        // Auto-focus next input
        const nextInput = document.getElementById(`otp-${index + 1}`)
        if (nextInput) {
          ;(nextInput as HTMLInputElement).focus()
        }
      }

      setOtp(newOtp)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) {
        ;(prevInput as HTMLInputElement).focus()
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpValue = otp.join('')
    if (otpValue.length === 6) {
      onVerify(otpValue)
    }
  }

  const isFilled = otp.every((digit) => digit !== '')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-sm text-brand-mutedText mb-4">
          We've sent a code to <span className="text-white font-semibold">{email}</span>
        </p>

        {/* OTP Input Grid */}
        <div className="flex gap-2 justify-center mb-6">
          {otp.map((digit, index) => (
            <motion.input
              key={index}
              id={`otp-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleOTPChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength={1}
              className="w-12 h-14 rounded-2xl bg-brand-cardBg border-2 border-brand-deep text-white text-center text-xl font-semibold focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/30 transition-all"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm mb-4"
          >
            {error}
          </motion.div>
        )}

        {/* Timer */}
        <div className="text-center text-sm text-brand-mutedText mb-4">
          {canResend ? (
            <button
              type="button"
              onClick={() => {
                onResend()
                setOtp(['', '', '', '', '', ''])
                setTimeLeft(60)
                setCanResend(false)
              }}
              className="text-brand-pink hover:underline font-semibold"
            >
              Resend Code
            </button>
          ) : (
            <span>Resend code in {timeLeft}s</span>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFilled}
        className="w-full py-3 rounded-2xl font-semibold text-white bg-gradient-pink hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        Verify
      </button>
    </form>
  )
}
