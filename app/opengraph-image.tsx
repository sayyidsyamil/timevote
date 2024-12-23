import { ImageResponse } from 'next/og';
import { HiOutlineCalendarDays } from 'react-icons/hi2';

export const runtime = 'edge';

export const alt = 'TimeVote - Your Polling Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return (
    new ImageResponse(
      (
        <div
          style={{
            fontSize: 128,
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <HiOutlineCalendarDays className="w-10 h-10 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">TimeVote</h1>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  );
}
