export interface Song {
  id: number;
  spaceId: number;
  played: boolean;
  addedById: number;
  extractedId: string;
  title: string;
  smallImg: string;
  bigImg: string;
  upVotes: number;
  haveUpVoted: boolean;
  createdAt: string;
  playedTs: string | null;
}

export interface CurrentStream {
  spaceId: number;
  songId: number;
  song: Song;
}

export interface QueueState {
  streams: Song[];
  activeStream: CurrentStream | null;
}

export interface VoteUpdate {
  songId: number;
  upVotes: number;
  haveUpVoted: boolean;
}
