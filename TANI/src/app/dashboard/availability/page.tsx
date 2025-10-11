'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

type Template = {
  id: string;
  weekday: number;
  startMinutes: number;
  endMinutes: number;
  breaksJson: string | null;
};

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

export default function AvailabilityEditor() {
  const [trainerId, setTrainerId] = useState<string>('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [bufferMinutes, setBufferMinutes] = useState(10);
  const [minNoticeMinutes, setMinNoticeMinutes] = useState(120);

  useEffect(() => {
    // Fetch trainer and templates
    fetch('/api/dashboard/trainer')
      .then(r => r.json())
      .then(data => {
        setTrainerId(data.trainer.id);
        setTemplates(data.templates);
        setBufferMinutes(data.trainer.bufferMinutes);
        setMinNoticeMinutes(data.trainer.minNoticeMinutes);
      });
  }, []);

  const handleTemplateChange = (weekday: number, field: string, value: any) => {
    setTemplates(prev => {
      const existing = prev.find(t => t.weekday === weekday);
      if (existing) {
        return prev.map(t => t.weekday === weekday ? { ...t, [field]: value } : t);
      } else {
        return [...prev, {
          id: '',
          weekday,
          startMinutes: field === 'startMinutes' ? value : 540,
          endMinutes: field === 'endMinutes' ? value : 1020,
          breaksJson: null,
        }];
      }
    });
  };

  const handleSave = async () => {
    await fetch('/api/dashboard/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trainerId,
        templates,
        bufferMinutes,
        minNoticeMinutes,
      }),
    });
    alert('Availability saved!');
  };

  return (
    <div className="container mx-auto px-4 py-8" style={{ marginTop: '-80px', paddingTop: '96px' }}>
      <Card>
        <CardHeader>
          <CardTitle>Availability Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buffer">Buffer between appointments (minutes)</Label>
              <Input
                id="buffer"
                type="number"
                value={bufferMinutes}
                onChange={(e) => setBufferMinutes(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="notice">Minimum advance notice (minutes)</Label>
              <Input
                id="notice"
                type="number"
                value={minNoticeMinutes}
                onChange={(e) => setMinNoticeMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Weekly Schedule</h3>
            <div className="space-y-2">
              {WEEKDAYS.map((day, idx) => {
                const template = templates.find(t => t.weekday === idx);
                const isActive = !!template;
                
                return (
                  <div key={idx} className="flex items-center gap-4 p-4 border rounded">
                    <div className="w-24">
                      <Switch
                        checked={isActive}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            setTemplates(prev => prev.filter(t => t.weekday !== idx));
                          } else {
                            handleTemplateChange(idx, 'active', true);
                          }
                        }}
                      />
                      <Label className="ml-2">{day}</Label>
                    </div>
                    {isActive && (
                      <>
                        <div>
                          <Label>Start</Label>
                          <Input
                            type="time"
                            value={minutesToTime(template.startMinutes)}
                            onChange={(e) => handleTemplateChange(idx, 'startMinutes', timeToMinutes(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>End</Label>
                          <Input
                            type="time"
                            value={minutesToTime(template.endMinutes)}
                            onChange={(e) => handleTemplateChange(idx, 'endMinutes', timeToMinutes(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Lunch Break</Label>
                          <Input
                            type="time"
                            placeholder="12:00"
                            onChange={(e) => {
                              if (e.target.value) {
                                const breakStart = timeToMinutes(e.target.value);
                                const breakEnd = breakStart + 60; // 1 hour lunch
                                handleTemplateChange(idx, 'breaksJson', JSON.stringify([
                                  { startMinutes: breakStart, endMinutes: breakEnd }
                                ]));
                              }
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">Save Availability</Button>
        </CardContent>
      </Card>
    </div>
  );
}
