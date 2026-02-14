import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    animation?: 'fade-in' | 'slide-up' | 'slide-in-right' | 'slide-in-left' | 'scale-in' | 'zoom-in' | 'blur-in' | 'fade-up-large';
    delay?: number;
    duration?: number;
    threshold?: number;
    once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    className,
    animation = 'slide-up',
    delay = 0,
    duration = 700,
    threshold = 0.1,
    once = true,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once && ref.current) {
                        observer.unobserve(ref.current);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold, once]);

    const getAnimationClass = () => {
        switch (animation) {
            case 'fade-in':
                return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';
            case 'slide-up':
                return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12';
            case 'slide-in-right':
                return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12';
            case 'slide-in-left':
                return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12';
            case 'scale-in':
                return isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95';
            case 'zoom-in':
                return isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75';
            case 'blur-in':
                return isVisible ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-110';
            case 'fade-up-large':
                return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-32';
            default:
                return isVisible ? 'opacity-100' : 'opacity-0';
        }
    };

    return (
        <div
            ref={ref}
            className={cn(
                'transition-all ease-out',
                getAnimationClass(),
                className
            )}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
};
