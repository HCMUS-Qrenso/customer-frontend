import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to demo restaurant table page for testing
  redirect('/demo-restaurant/t/TABLE05');
}
