import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the QuestionForm component with no SSR
const QuestionForm = dynamic(
  () => import('./questionForm'),
  { 
    ssr: false,
    loading: () => <div>Loading interview interface...</div>
  }
);

// This component will only be rendered on the client side
export default function QuestionFormWrapper() {
  return (
    <Suspense fallback={<div>Loading interview interface...</div>}>
      <QuestionForm />
    </Suspense>
  );
}
