import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 1800, start = true) {
    const [count, setCount] = useState(0);
    const ref = useRef<number>(0);

    useEffect(() => {
        if (!start) return;
        ref.current = 0;
        const startTime = performance.now();
        const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            ref.current = Math.floor(eased * target);
            setCount(ref.current);
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
        };
        requestAnimationFrame(step);
    }, [target, duration, start]);

    return count;
}
