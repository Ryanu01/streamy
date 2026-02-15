
# Streamy

  

>  **The Aux is a Battlefield**

  

A real-time collaborative music streaming platform where users vote on what plays next. Built with Next.js, Socket.IO, and YouTube integration.

  

<!-- ![Streamy Screenshot](https://your-screenshot-url-here.png) -->

  

## Features

  

### Room-Based Music Streaming

- Create or join music rooms

- Each room has a queue of songs

- Host controls playback

- Real-time updates for all users

  

### Voting System

-  **Upvote** songs to push them higher in the queue

-  **Downvote** to lower their priority

- Songs are automatically sorted by vote count

- Democratic music selection

  

### Real-Time Sync

- Instant updates using WebSocket

- See votes change live

- Watch the queue update in real-time

- No page refresh needed

  

### YouTube Integration

- Add songs from YouTube URLs

- Host sees the YouTube player with controls

- Other users see song info and thumbnails

- Automatic playback for host

  

### Single Room Policy

- Users can only be in one room at a time

- Prevents queue confusion

- Redirects to current room if trying to join another

  

## Getting Started

  

### Prerequisites

- Node.js 18+

- PostgreSQL database

- YouTube API access (optional, for better video data)

  

### Installation

  

1.  **Clone the repository**

```bash

git clone https://github.com/yourusername/streamy.git

cd streamy

```

  

2.  **Install dependencies**

```bash

npm install

```

  

3.  **Set up environment variables**

```bash

cp .env.example .env

```

Edit `.env` with your values:

```env

DATABASE_URL="postgresql://user:password@localhost:5432/streamy"

NEXTAUTH_SECRET="your-secret-key"

NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="your-google-client-id"

GOOGLE_CLIENT_SECRET="your-google-client-secret"

```

  

4.  **Set up the database**

```bash

npx prisma migrate dev

npx prisma generate

```

  

5.  **Start the development server**

```bash

npm run dev

```

  

6.  **Open in browser**

Navigate to `http://localhost:3000`

  

##  How to Use

  

### Creating a Room

1. Sign in with your Google account

2. Click "START A ROOM"

3. Enter a room name

4. Share the room ID with friends

  

### Joining a Room

1. Enter the room ID in the input field

2. Click "JOIN"

3. You're now in the room!

  

### Adding Songs

1. Paste a YouTube URL in the "PASTE YOUTUBE URL TO QUEUE" field

2. Click "+ ADD TRACK"

3. Song appears in the queue

  

### Voting

- Click **↑** to upvote a song

- Click **↓** to downvote (removes your upvote)

- Songs reorder automatically based on votes

  

### For Hosts

-  **Play/Pause**: Control playback via YouTube player

-  **Next**: Skip to the next song

-  **Volume**: Mute/unmute audio

-  **Leave**: Exit the room (clears room tracking)

  

## Architecture

  

### Tech Stack

-  **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS

-  **Backend**: Next.js API Routes, Prisma ORM

-  **Database**: PostgreSQL

-  **Real-time Queue**: Socket.IO

-  **Authentication**: NextAuth.js (Google OAuth)

-  **Video**: YouTube IFrame API

  

### Project Structure

```

streamy/

├── app/

│ ├── api/ # API routes

│ │ ├── streams/ # Room management

│ │ ├── socket/ # Socket initialization

│ │ └── auth/ # Authentication

│ ├── context/ # React Context providers

│ ├── hooks/ # Custom React hooks

│ ├── types/ # TypeScript types

│ └── main/[roomId]/ # Room pages

├── components/ # UI components

│ ├── ui/ # shadcn/ui components

│ ├── ytvideoPlayer.tsx # YouTube player

│ ├── Queue.tsx # Song queue

│ └── VideoPlayer.tsx # Main player layout

├── prisma/

│ └── schema.prisma # Database schema

└── server.js # Custom Socket.IO server

```

  

### Database Schema

  

**User**

- id, name, email, authType

- Can have multiple spaces

- Can be members of multiple spaces

  

**Space (Room)**

- id, name, hostId

- Has many songs and members

  

**Song**

- id, spaceId, title, extractedId (YouTube ID)

- upVotes count, played status

- addedBy user reference

  

**CurrentStream**

- Tracks currently playing song per space

  

**UpVote**

- User-Song relationship for voting

  

## Security Features

  

- Single room policy prevents queue manipulation

- Only hosts can control playback

- NextAuth.js for secure authentication

- CORS configured for Socket.IO

- Input validation on all API routes

  
  
  

## Contributing

  

1. Fork the repository

2. Create your feature branch (`git checkout -b feature/AmazingFeature`)

3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)

4. Push to the branch (`git push origin feature/AmazingFeature`)

5. Open a Pull Request

  

## License

  

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

  

## Acknowledgments

  

- Built with [shadcn/ui](https://ui.shadcn.com/) components and [itshover](https://www.itshover.com/)

- Inspired by the aux cord battles of car rides past

- Thanks to all contributors and testers

  

---

  

**Made with ♥ and too much caffeine**

  

*Note: Streamy is a personal project for educational purposes. Please respect YouTube's Terms of Service and copyright laws when using this application.*