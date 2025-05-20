import React from 'react';
// ShadCN UI Components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components

// Define phase colors (Tailwind classes)
const PHASE_COLORS = {
  Listen: 'bg-blue-500',
  Think: 'bg-green-500',
  Speak: 'bg-yellow-500',
};

// Optional: Hex colors if needed elsewhere, e.g., for exact color matching in legend style
const PHASE_HEX_COLORS = {
    Listen: '#3b82f6',
    Think: '#22c55e',
    Speak: '#eab308',
};

const ProfilerTimelineComponent = ({ chat }) => {
  // 1. Data Processing (same as before)
  const T0 = new Date(chat.createdAt).getTime();
  if (isNaN(T0)) {
    console.error('Invalid chat.createdAt:', chat.createdAt);
    return <Card><CardContent>Ошибка: Неверное время начала чата.</CardContent></Card>;
  }

  const processedMessages = [];
  let maxEndTime = 0;

  chat.messages.forEach((message) => {
    const messageTimestamp = new Date(message.timestamp).getTime();
    if (isNaN(messageTimestamp)) {
      console.error('Invalid timestamp for message:', message.id, message.timestamp);
      return;
    }

    const phases = [];
    let currentStartTimeSec = (messageTimestamp - T0) / 1000;
    const metrics = message.metrics || {};

    // Listen Phase
    if (metrics.listenTimeMs != null && !isNaN(metrics.listenTimeMs)) {
      const duration = metrics.listenTimeMs / 1000;
      if (duration >= 0) {
        phases.push({
          id: `${message.id}-listen`, phase: 'Listen', start: currentStartTimeSec, duration,
          colorClass: PHASE_COLORS.Listen, hexColor: PHASE_HEX_COLORS.Listen,
        });
        currentStartTimeSec += duration;
      } else { console.warn(`[Msg ${message.id}] Negative/Invalid listenTimeMs:`, metrics.listenTimeMs); }
    } else if (metrics.listenTimeMs != null) { console.warn(`[Msg ${message.id}] Invalid listenTimeMs format:`, metrics.listenTimeMs); }

    // Think Phase
    if (metrics.thinkTimeMs != null && !isNaN(metrics.thinkTimeMs)) {
      const duration = metrics.thinkTimeMs / 1000;
       if (duration >= 0) {
        phases.push({
          id: `${message.id}-think`, phase: 'Think', start: currentStartTimeSec, duration,
          colorClass: PHASE_COLORS.Think, hexColor: PHASE_HEX_COLORS.Think,
        });
        currentStartTimeSec += duration;
       } else { console.warn(`[Msg ${message.id}] Negative/Invalid thinkTimeMs:`, metrics.thinkTimeMs); }
    } else if (metrics.thinkTimeMs != null) { console.warn(`[Msg ${message.id}] Invalid thinkTimeMs format:`, metrics.thinkTimeMs); }

    // Speak Phase
    if (metrics.speakTimeMs != null && !isNaN(metrics.speakTimeMs)) {
      const duration = metrics.speakTimeMs / 1000;
      if (duration >= 0) {
        phases.push({
          id: `${message.id}-speak`, phase: 'Speak', start: currentStartTimeSec, duration,
          colorClass: PHASE_COLORS.Speak, hexColor: PHASE_HEX_COLORS.Speak,
        });
        currentStartTimeSec += duration;
      } else { console.warn(`[Msg ${message.id}] Negative/Invalid speakTimeMs:`, metrics.speakTimeMs); }
    } else if (metrics.speakTimeMs != null) { console.warn(`[Msg ${message.id}] Invalid speakTimeMs format:`, metrics.speakTimeMs); }

    // Add message if it has phases
    if (phases.length > 0) {
      processedMessages.push({
        messageId: message.id, sender: message.sender, phases: phases,
        messageEndTime: currentStartTimeSec
      });
      maxEndTime = Math.max(maxEndTime, currentStartTimeSec);
    }
  });

  // Handle no data
  if (processedMessages.length === 0) {
     return <Card><CardContent>Нет данных для отображения временной шкалы.</CardContent></Card>;
  }

  // Handle invalid maxEndTime
   if (isNaN(maxEndTime) || maxEndTime <= 0) {
     console.warn('Invalid maxEndTime calculated:', maxEndTime, 'Falling back to 1 second.');
     maxEndTime = 1;
   }

   // --- Compact Layout Adjustments ---
   const rowHeightClass = "h-5"; // Reduced height (h-6: 24px, h-5: 20px)
   const rowMarginClass = "mb-0.5"; // Reduced margin (mb-0.5: 2px)
   const labelLineHeightClass = "leading-5"; // Match row height
   const legendGapClass = "gap-x-3"; // Slightly reduced gap
   const legendMarginBottomClass = "mb-3"; // Slightly reduced margin
   const containerPaddingBottomClass = "pb-4"; // Reduced padding for time axis
   const timeAxisPaddingTopClass = "pt-0.5"; // Reduced padding top for axis
   const labelPaddingRightClass = "pr-3"; // Slightly reduced padding
   const minBarWidthPx = 2; // Minimal visible width for a bar

  // 2. Rendering with Tailwind, ShadCN Tooltips, and Compact Layout
  return (
    // Wrap CardContent (or higher) in TooltipProvider
    <TooltipProvider delayDuration={150}>
      <Card>
        <CardHeader>
          <CardTitle>{chat.title} - Временная шкала обработки (Компактная)</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className={`flex flex-wrap ${legendGapClass} ${legendMarginBottomClass} text-xs`}> {/* Smaller text */}
            {Object.entries(PHASE_COLORS).map(([phase, colorClass]) => (
              <div key={phase} className="flex items-center">
                <span
                  className={`inline-block w-3 h-3 mr-1 rounded-sm border border-black/10 dark:border-white/10 ${colorClass}`} // Slightly smaller swatch
                  // style={{ backgroundColor: PHASE_HEX_COLORS[phase] }} // Alt color method
                ></span>
                {phase}
              </div>
            ))}
          </div>

          {/* Timeline Container */}
          <div className={`flex w-full overflow-x-auto relative ${containerPaddingBottomClass}`}>
            {/* Labels Column */}
            <div className={`flex-shrink-0 ${labelPaddingRightClass} text-right`}>
               {processedMessages.map(msg => (
                 <div
                   key={msg.messageId}
                   className={`${rowHeightClass} ${labelLineHeightClass} ${rowMarginClass} text-xs text-muted-foreground whitespace-nowrap`}
                 >
                   Msg {msg.messageId} ({msg.sender})
                 </div>
               ))}
            </div>

            {/* Tracks Container */}
            <div className="flex-grow relative border-l border-border">
              {processedMessages.map(msg => (
                <div
                  key={msg.messageId}
                  className={`relative ${rowHeightClass} ${rowMarginClass} bg-muted rounded`}
                >
                  {msg.phases.map(phase => {
                     const leftPercent = (phase.start / maxEndTime) * 100;
                     const widthPercent = (phase.duration / maxEndTime) * 100;
                     const safeLeft = Math.max(0, leftPercent);
                     const safeWidth = Math.max(0, widthPercent);

                    return (
                      // --- ShadCN Tooltip Integration ---
                      <Tooltip key={phase.id}>
                        <TooltipTrigger asChild>
                           <div
                             // title removed - using ShadCN Tooltip now
                             className={`absolute top-0 h-full rounded box-border opacity-85 hover:opacity-100 transition-opacity duration-200 ease-in-out z-0 hover:z-10 flex items-center justify-center text-xs font-semibold text-white overflow-hidden whitespace-nowrap ${phase.colorClass} [text-shadow:1px_1px_1px_rgba(0,0,0,0.3)]`}
                             style={{
                               left: `${safeLeft}%`,
                               width: `${safeWidth}%`,
                               minWidth: `${minBarWidthPx}px`,
                             }}
                           >
                             {/* Show phase initial if space is very limited but > minWidth */}
                             {safeWidth > 3 && safeWidth <= 5 && phase.phase.charAt(0)}
                             {/* Show full phase name if more space */}
                             {safeWidth > 5 && phase.phase}
                           </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">Msg {msg.messageId} - {phase.phase}</p>
                          <p className="text-sm text-muted-foreground">
                            Start: {phase.start.toFixed(2)}s | Duration: {phase.duration.toFixed(4)}s
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      // --- End Tooltip Integration ---
                    );
                  })}
                </div>
              ))}
              {/* Time Axis */}
              <div className={`absolute bottom-0 left-0 w-full flex justify-between text-xs text-muted-foreground ${timeAxisPaddingTopClass} border-t border-border`}>
                 <span>0s</span>
                 <span>{(maxEndTime / 2).toFixed(1)}s</span>
                 <span>{maxEndTime.toFixed(1)}s</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
export const ProfilerTimelineSingleBar = ({ chat }) => {
  // 1. Data Processing for a Flat Phase List
  const T0 = new Date(chat.createdAt).getTime();
  if (isNaN(T0)) {
    console.error('Invalid chat.createdAt:', chat.createdAt);
    return <Card><CardContent>Ошибка: Неверное время начала чата.</CardContent></Card>;
  }

  const allPhases = []; // Single flat array for all phases
  let maxEndTime = 0;
  // Keep track of message start/end times if needed for other grouping visuals later
  const messageTimings = {};

  chat.messages.forEach((message) => {
    const messageTimestamp = new Date(message.timestamp).getTime();
    if (isNaN(messageTimestamp)) {
      console.error('Invalid timestamp for message:', message.id, message.timestamp);
      return;
    }

    let currentStartTimeSec = (messageTimestamp - T0) / 1000;
    const messageId = message.id;
    const sender = message.sender;
    const metrics = message.metrics || {};
    let messageHasPhases = false;

    if (!messageTimings[messageId]) {
        messageTimings[messageId] = { start: currentStartTimeSec, end: currentStartTimeSec };
    }

    // --- Process Phases (Listen, Think, Speak) ---
    // Listen
    if (metrics.listenTimeMs != null && !isNaN(metrics.listenTimeMs)) {
      const duration = metrics.listenTimeMs / 1000;
      if (duration >= 0) {
        allPhases.push({
          id: `${messageId}-listen`, messageId, sender, phase: 'Listen', start: currentStartTimeSec, duration,
          colorClass: PHASE_COLORS.Listen,
        });
        currentStartTimeSec += duration;
        messageHasPhases = true;
      } // Add else for logging if needed
    } // Add else for logging if needed

    // Think
    if (metrics.thinkTimeMs != null && !isNaN(metrics.thinkTimeMs)) {
      const duration = metrics.thinkTimeMs / 1000;
       if (duration >= 0) {
        allPhases.push({
          id: `${messageId}-think`, messageId, sender, phase: 'Think', start: currentStartTimeSec, duration,
          colorClass: PHASE_COLORS.Think,
        });
        currentStartTimeSec += duration;
        messageHasPhases = true;
       } // Add else for logging if needed
    } // Add else for logging if needed

    // Speak
    if (metrics.speakTimeMs != null && !isNaN(metrics.speakTimeMs)) {
      const duration = metrics.speakTimeMs / 1000;
      if (duration >= 0) {
        allPhases.push({
          id: `${messageId}-speak`, messageId, sender, phase: 'Speak', start: currentStartTimeSec, duration,
          colorClass: PHASE_COLORS.Speak,
        });
        currentStartTimeSec += duration;
        messageHasPhases = true;
      } // Add else for logging if needed
    } // Add else for logging if needed
    // --- End Phase Processing ---

    if (messageHasPhases) {
        messageTimings[messageId].end = currentStartTimeSec; // Update message end time
        maxEndTime = Math.max(maxEndTime, currentStartTimeSec);
    }
  });

  // Sort phases by start time just in case the calculation order isn't strictly sequential
  // (though it should be with the current logic)
  allPhases.sort((a, b) => a.start - b.start);

  if (allPhases.length === 0) {
     return <Card><CardContent>Нет данных для отображения временной шкалы.</CardContent></Card>;
  }

   if (isNaN(maxEndTime) || maxEndTime <= 0) {
     console.warn('Invalid maxEndTime calculated:', maxEndTime, 'Falling back to 1 second.');
     maxEndTime = 1;
   }

   const barHeightClass = "h-3"; // Height for the single bar (e.g., h-6: 24px)
   const minBarWidthPx = 2; // Minimal visible width for a phase segment
   // Style for the divider between messages on the single bar
   const messageDividerClass = "border-l-2 border-white dark:border-gray-950"; // Adjust color for contrast

  // 2. Rendering the Single Bar Timeline
  return (
    <TooltipProvider delayDuration={150}>
      <Card className='py-0 border-0'>
        <CardContent className="py-0 border-0">
          {/* Legend (same as before, maybe adjust margins/size if needed) */}
          <div className="flex flex-wrap gap-x-3 mb-3 text-xs">
            {Object.entries(PHASE_COLORS).map(([phase, colorClass]) => (
              <div key={phase} className="flex items-center">
                <span className={`inline-block w-3 h-3 mr-1 rounded-sm border border-black/10 dark:border-white/10 ${colorClass}`}></span>
                {phase}
              </div>
            ))}
          </div>

          {/* Single Timeline Track Container */}
          <div className="relative w-full mb-2"> {/* mb-4 provides space for time axis below */}
             {/* The Track Background */}
             <div className={`w-full ${barHeightClass} bg-muted rounded`}></div>

             {/* Absolutely Positioned Phase Segments */}
             <div className={`absolute top-0 left-0 w-full ${barHeightClass}`}>
                {allPhases.map((phase, index) => {
                    const leftPercent = (phase.start / maxEndTime) * 100;
                    const widthPercent = (phase.duration / maxEndTime) * 100;
                    const safeLeft = Math.max(0, leftPercent);
                    const safeWidth = Math.max(0, widthPercent);

                    // Determine if this phase starts a new message group
                    const isNewMessage = index > 0 && phase.messageId !== allPhases[index - 1].messageId;

                    return (
                      <Tooltip key={phase.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={`absolute top-0 ${barHeightClass} box-border opacity-90 hover:opacity-100 transition-opacity duration-200 ease-in-out z-0 hover:z-10 flex items-center justify-center text-xs font-semibold text-white overflow-hidden whitespace-nowrap ${phase.colorClass} ${isNewMessage ? messageDividerClass : ''} first:rounded-l last:rounded-r [text-shadow:1px_1px_1px_rgba(0,0,0,0.3)]`} // Add divider class conditionally, round ends
                            style={{
                              left: `${safeLeft}%`,
                              width: `${safeWidth}%`,
                              minWidth: `${minBarWidthPx}px`,
                              // Add slight rounding only to the very first and very last segments
                              // borderRadius: index === 0 ? '0.25rem 0 0 0.25rem' : (index === allPhases.length - 1 ? '0 0.25rem 0.25rem 0' : '0'), // Handled by first:/last: rounded utils now
                            }}
                          >
                            {/* Display content inside bar if wide enough */}
                            {safeWidth > 4 && phase.phase.charAt(0)}
                            {safeWidth > 8 && phase.phase.substring(1)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">Msg {phase.messageId} ({phase.sender}) - {phase.phase}</p>
                          <p className="text-sm text-muted-foreground">
                            Start: {phase.start.toFixed(2)}s | Duration: {phase.duration.toFixed(4)}s
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                })}
             </div>

             {/* Time Axis */}
             <div className="relative w-full flex justify-between text-xs text-muted-foreground pt-1 border-t border-border mt-1"> {/* Added mt-1 */}
                <span>0s</span>
                <span>{(maxEndTime / 2).toFixed(1)}s</span>
                <span>{maxEndTime.toFixed(1)}s</span>
             </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ProfilerTimelineComponent;