import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Calendar, User } from 'lucide-react';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <CardHeader>
        <CardTitle>Event Title</CardTitle>
        <CardDescription>Event description goes here</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          <span>July 29, 2025</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="mr-2 h-4 w-4" />
          <span>50 attendees</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Details</Button>
        <Button>Register</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithImage: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px] overflow-hidden">
      <div className="h-40 bg-muted">
        {/* Placeholder for image */}
        <div className="h-full w-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
          <span className="text-muted-foreground">Event Image</span>
        </div>
      </div>
      <CardHeader>
        <CardTitle>Event with Image</CardTitle>
        <CardDescription>This card includes a header image</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This is an example of a card with an image header and content below it.
        </p>
      </CardContent>
    </Card>
  ),
};
