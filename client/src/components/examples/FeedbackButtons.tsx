import FeedbackButtons from '../FeedbackButtons';

export default function FeedbackButtonsExample() {
  return (
    <div className="min-h-screen bg-background flex items-end">
      <div className="w-full">
        <FeedbackButtons 
          cardId="example-card"
          onFeedback={(reaction) => console.log('Feedback reaction:', reaction)}
        />
      </div>
    </div>
  );
}