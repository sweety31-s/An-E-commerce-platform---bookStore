export default function StepProgress({ steps, current }) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, i) => {
          const isCompleted = i < current;
          const isActive    = i === current;
          const isLast      = i === steps.length - 1;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Step circle */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 z-10 relative
                    ${isCompleted
                      ? 'bg-green-500 text-white shadow-sm ring-4 ring-green-100'
                      : isActive
                        ? 'bg-blue-600 text-white shadow-glow-blue ring-4 ring-blue-100'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'}`}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                  {/* Active pulse ring */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping" />
                  )}
                </div>
                {/* Label */}
                <span
                  className={`absolute top-10 text-[10px] font-bold whitespace-nowrap transition-colors duration-200
                    ${isCompleted ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-400'}`}
                >
                  {step}
                </span>
              </div>

              {/* Connector line (not after last) */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-1 overflow-hidden relative -mt-5">
                  <div className="h-full bg-gray-200 rounded-full" />
                  <div
                    className={`absolute inset-y-0 left-0 bg-green-400 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
