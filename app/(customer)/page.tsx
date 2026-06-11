import { ChatInput } from '@/components/customer/chat-input';
import { ChatMessageList } from '@/components/customer/chat-message-list';
import { ChatProvider } from '@/components/customer/chat-provider';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function Page() {
  return (
    <ChatProvider>
      <Card className='flex flex-col'>
        <CardContent>
          <ChatMessageList />
        </CardContent>
        <CardFooter>
          <ChatInput />
        </CardFooter>
      </Card>
    </ChatProvider>
  );
}
