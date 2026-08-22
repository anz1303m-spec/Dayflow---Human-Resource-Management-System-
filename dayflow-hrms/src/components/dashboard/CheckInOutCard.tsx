import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Clock, Play, Square, Coffee } from 'lucide-react';
import { formatTime } from '../../utils/formatters';

export const CheckInOutCard: React.FC = () => {
  const { effectiveUser } = useAuth();
  const { getTodayAttendance, clockIn, clockOut } = useHRMS();

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [onBreak, setOnBreak] = useState<boolean>(false);

  const todayRecord = effectiveUser ? getTodayAttendance(effectiveUser.id) : undefined;
  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;

  useEffect(() => {
    let interval: any;
    if (isCheckedIn && !onBreak) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, onBreak]);

  useEffect(() => {
    if (todayRecord?.checkIn && !todayRecord?.checkOut) {
      setElapsedSeconds(4 * 3600 + 15 * 60);
    } else if (todayRecord?.checkOut) {
      setElapsedSeconds(8.5 * 3600);
    } else {
      setElapsedSeconds(0);
    }
  }, [todayRecord]);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const formattedDuration = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const targetHours = 8;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / (targetHours * 3600)) * 100));

  if (!effectiveUser) return null;

  return (
    <Card className="overflow-hidden">
      {/* Thin progress bar at top */}
      <div className="h-[3px] bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-slate-400 dark:bg-slate-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Today's Workday
              </span>
              <Badge status={todayRecord?.status || 'absent'} pulse={isCheckedIn} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono tracking-tight text-slate-800 dark:text-slate-100">
                {formattedDuration}
              </span>
              <span className="text-xs text-slate-400">/ 08:00:00</span>
            </div>
            <p className="text-xs text-slate-400">
              {todayRecord?.checkIn
                ? `In at ${formatTime(todayRecord.checkIn)}${todayRecord.checkOut ? ` · Out at ${formatTime(todayRecord.checkOut)}` : ''}`
                : 'You have not punched in yet today.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isCheckedIn ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => clockIn(effectiveUser.id)}
                leftIcon={<Play className="h-3.5 w-3.5" />}
              >
                {todayRecord?.checkOut ? 'Clock In Again' : 'Clock In'}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOnBreak(!onBreak)}
                  leftIcon={<Coffee className="h-3.5 w-3.5 text-slate-400" />}
                >
                  {onBreak ? 'Resume' : 'Break'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clockOut(effectiveUser.id)}
                  leftIcon={<Square className="h-3.5 w-3.5 text-slate-400" />}
                >
                  Clock Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
