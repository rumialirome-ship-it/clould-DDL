import React, { useState, useEffect, useCallback } from 'react';

// Sub-component for a single time unit (e.g., hours, minutes)
const TimeUnit: React.FC<{ value: string; label: string }> = ({ value, label }) => {
    // We use a state and key to re-trigger the animation on each change
    const [currentValue, setCurrentValue] = useState(value);
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
        // When the incoming value prop changes, update the key to restart the animation
        if (value !== currentValue) {
            setAnimationKey(prev => prev + 1);
            setCurrentValue(value);
        }
    }, [value, currentValue]);

    return (
        <div className="flex flex-col items-center">
            <div className="countdown-box">
                <span key={animationKey} className="countdown-number animate-slide-down-pop">
                    {value}
                </span>
            </div>
            <span className="text-xs block uppercase text-brand-text-secondary mt-1">{label}</span>
        </div>
    );
};


const Countdown: React.FC<{ targetDate: Date; onComplete?: () => void }> = ({ targetDate, onComplete }) => {
    const calculateTimeLeft = useCallback(() => {
        const difference = +targetDate - +new Date();
        return difference > 0 ? {
            hours: Math.floor(difference / (1000 * 60 * 60)),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        } : null;
    }, [targetDate]);
    
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    
    useEffect(() => {
        if (!timeLeft) {
            if (onComplete) {
                onComplete();
            }
            return;
        }

        const timer = setTimeout(() => {
            const newTime = calculateTimeLeft();
            setTimeLeft(newTime);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, calculateTimeLeft, onComplete]);

    const format = (num: number) => num.toString().padStart(2, '0');
    
    if (!timeLeft) {
        return null;
    }
    
    return (
        <div className="flex items-center justify-center space-x-2">
            <TimeUnit value={format(timeLeft.hours)} label="hrs" />
            <span className="countdown-separator">:</span>
            <TimeUnit value={format(timeLeft.minutes)} label="min" />
            <span className="countdown-separator">:</span>
            <TimeUnit value={format(timeLeft.seconds)} label="sec" />
        </div>
    );
};

export default Countdown;