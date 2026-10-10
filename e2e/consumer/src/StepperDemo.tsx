import { useState } from 'react';
import { Button, Heading, Inline, Stack, Stepper, Text, type StepperItem } from '@yarcl/react';

const stages = [
  { id: 'details', label: 'Details', description: 'Your information' },
  { id: 'payment', label: 'Payment', description: 'Payment method' },
  { id: 'review', label: 'Review', description: 'Confirm everything' },
] as const satisfies readonly StepperItem[];

type Stage = typeof stages[number]['id'];

/** A controlled three-stage checkout with independently tracked completion. */
export function StepperDemo() {
  const [stage, setStage] = useState<Stage | null>('details');
  const [completed, setCompleted] = useState<Stage[]>([]);
  const index = stages.findIndex((item) => item.id === stage);
  function next() { if (stage === null) return; setCompleted((values) => values.includes(stage) ? values : [...values, stage]); setStage(index === stages.length - 1 ? null : stages[index + 1].id); }
  return <Stack as="section">
    <Heading level={2}>Checkout progress</Heading>
    <Text>Choose an available stage, or complete it to continue.</Text>
    <Stepper aria-label="Checkout" items={stages.map((item) => ({ ...item, completed: completed.includes(item.id), disabled: item.id === 'review' && !completed.includes('payment') }))} value={stage} onValueChange={setStage} />
    <Text role="status">{stage === null ? 'Checkout completed' : `Current stage: ${stages[index].label}`}</Text>
    <Inline><Button disabled={index <= 0} onClick={() => setStage(stages[Math.max(0, index - 1)].id)}>Previous</Button><Button disabled={stage === null} onClick={next}>{stage === null ? 'Checkout completed' : index === stages.length - 1 ? 'Complete checkout' : 'Complete and continue'}</Button></Inline>
  </Stack>;
}
