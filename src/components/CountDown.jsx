import { useEffect, useState } from "react";

const Countdown = ({ onFinish }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onFinish();
    }
  }, [count, onFinish]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <span className="text-white text-7xl font-bold animate-pulse">{count}</span>
    </div>
  );
};

export default Countdown;
