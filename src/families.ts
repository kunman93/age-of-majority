export type Message = {
  author: string
  text: string
}

export type Family = {
  name: string
  messages: readonly Message[]
}

export const families: readonly Family[] = [
  {
    name: 'Family Lorem',
    messages: [
      {
        author: 'Family Lorem',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      },
    ],
  },
  {
    name: 'Family Ipsum',
    messages: [
      {
        author: 'Anna Ipsum',
        text: 'Lorem ipsum ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      },
      {
        author: 'Ben Ipsum',
        text: 'Lorem ipsum duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      },
    ],
  },
  {
    name: 'Family Dolor',
    messages: [
      {
        author: 'Family Dolor',
        text: 'Lorem ipsum excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      },
      {
        author: 'Clara Dolor',
        text: 'Lorem ipsum sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
      },
    ],
  },
]
