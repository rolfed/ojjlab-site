/**
 * Curated Google reviews for Oregon Jiu Jitsu Lab.
 * Sorted: 5-star first, then by recency (most recent first).
 * Source: Google Business Profile reviews.
 */

export interface Review {
  author: string
  rating: 1 | 2 | 3 | 4 | 5
  date: string
  text: string
  /** true when the original Google review was truncated ("… More") */
  truncated: boolean
}

export const REVIEWS: Review[] = [
  // ── 5-star reviews, most recent first ────────────────────────────────────
  {
    author: 'Luis Sierra',
    rating: 5,
    date: '3 months ago',
    text: 'Been here for close to 2 years. First review I write for any gym. I really like the warm ups, move breakdowns and how much time we actually get to roll. Adam and Dan have a great environment any bjj athlete.',
    truncated: false,
  },
  {
    author: 'Nova & Kyle Gregory',
    rating: 5,
    date: '4 months ago',
    text: 'One of the best gyms I have been a member of! I have been a member of multiple gyms in three different states and this has been the best yet. Coach Adam and Dan both spend a ton of time with students one on one, and have very structured lesson plans.',
    truncated: true,
  },
  {
    author: 'Zachary Funderburk',
    rating: 5,
    date: '4 months ago',
    text: "I've been going to this gym since January, and it's been an amazing experience for both me and my kids (8 and 4). The instructors are top notch — patient, professional, and always put safety first. My son has special needs, and they've been incredibly accommodating.",
    truncated: true,
  },
  {
    author: 'Preston S.',
    rating: 5,
    date: '4 months ago',
    text: "I've had the pleasure of training at Oregon Jiu Jitsu Lab for a few weeks now, and one of the standout aspects of this gym is its inclusivity. It welcomes people of all ages, genders, fitness levels, and backgrounds. From the moment I walked in, I felt at home.",
    truncated: true,
  },
  {
    author: 'Dustin Caley',
    rating: 5,
    date: '5 months ago',
    text: 'Oregon Jiu Jitsu Lab is an amazing gym! The atmosphere and people made me feel like family from day one. Both coach Adam and Dan break down class details into easily consumed concepts that are great for any level practitioner!',
    truncated: true,
  },
  {
    author: 'Thy Ha',
    rating: 5,
    date: '5 months ago',
    text: "I wish all teenage girls would give Jiu Jitsu a try. It's a great way to build confidence. My two daughters have joined three other dojos over the years and we've liked all of them. But my daughters have truly found their home at Oregon Jiu Jitsu Lab.",
    truncated: true,
  },
  {
    author: 'Phong Nguyen',
    rating: 5,
    date: '5 months ago',
    text: 'This is more than a dojo, my teenage girls feel at home here. Adam and Dan have done a good job creating a community that welcomes all skill levels. It has been a wonderful place to build skills and confidence.',
    truncated: false,
  },
  {
    author: 'Maya Lindskog',
    rating: 5,
    date: '5 months ago',
    text: "Everyone here is so welcoming and supportive. I've been going to OJJL for a few weeks now and they've all been super encouraging and helpful. Great energy and vibes with great coaches/trainers who communicate clearly and are patient.",
    truncated: true,
  },
  {
    author: 'Cobe Yoshino',
    rating: 5,
    date: '5 months ago',
    text: 'Amazing gym, instructors, and students. Everyone is incredibly welcoming and generous with their time. Highly recommend.',
    truncated: false,
  },
  {
    author: 'Mackenzie Loeks',
    rating: 5,
    date: '5 months ago',
    text: "I walked into OJJ Lab as one of the only women, all by myself, and was immediately welcomed in. I felt safe right away, which says so much about the atmosphere here. The adults' classes are laid back and fun, with plenty of laughs and good technique.",
    truncated: true,
  },
  {
    author: 'Steven Vournazos',
    rating: 5,
    date: '6 months ago',
    text: "Came to Oregon for work and couldn't be happier with the quality of training at Oregon Jiu Jitsu Lab. Unbelievably supportive and hospitable coaches and upper belts, live positional drilling, and fun live rolls. Stellar community — highly recommend if you're in the area!",
    truncated: false,
  },
  {
    author: 'Vince Hcrc',
    rating: 5,
    date: '7 months ago',
    text: 'These guys are great, a family friendly environment and an awesome incubator for my kids and their journey through the world of Jiu Jitsu.',
    truncated: false,
  },
  {
    author: 'C. B.',
    rating: 5,
    date: '8 months ago',
    text: 'Honest and honorable coaches you can trust. Welcoming atmosphere.',
    truncated: false,
  },
  {
    author: 'Logan Keppel',
    rating: 5,
    date: '9 months ago',
    text: 'A great place to start your BJJ journey with knowledgeable coaches and great people.',
    truncated: false,
  },
  {
    author: 'Jaden Dolan',
    rating: 5,
    date: '9 months ago',
    text: "I've had an exceptional experience training at Oregon Jiu Jitsu Lab. The environment is welcoming, respectful, and highly focused on both personal growth and technical development. Whether you're a complete beginner or an experienced practitioner, this is the place to train.",
    truncated: true,
  },
  {
    author: 'Holly Takahani',
    rating: 5,
    date: '9 months ago',
    text: 'Seriously excellent.',
    truncated: false,
  },
  {
    author: 'Zack Bradcovich',
    rating: 5,
    date: '10 months ago',
    text: 'Dropped in for open mat, and everyone was super friendly and chill to roll with. Professor Adam and Dan were super great and even offered some advice to improve my game. Much appreciated!',
    truncated: false,
  },
  {
    author: 'Brittney Lee',
    rating: 5,
    date: 'a year ago',
    text: "OJJL has been great for our son who is on the younger side of the class age range. There's something to be said about the coaches and how great they are with children. We appreciate their approach to building confidence.",
    truncated: true,
  },
  {
    author: 'Katie Trautman',
    rating: 5,
    date: 'a year ago',
    text: "While visiting family I contacted these guys and talked to Daniel about dropping in on a class. Daniel responded quickly and I was able to train a few times! Everyone was extremely welcoming and helpful and the restrooms and mats were very clean.",
    truncated: true,
  },
  {
    author: 'Tom Greenwood',
    rating: 5,
    date: 'a year ago',
    text: 'Readily apparent the instructors are good with kids. They are practiced at recognizing the line between pushing a kid to their potential and time to take a break.',
    truncated: false,
  },
  {
    author: 'Noah Murphy',
    rating: 5,
    date: 'a year ago',
    text: 'Was a little apprehensive to start BJJ at 41 but after one class, I was hooked. It is such a great environment to learn and train in for whatever your goals in Jiu Jitsu are. The coaches are very knowledgeable and amazing teachers. A lot of good times and even better friends have been made here!',
    truncated: false,
  },
  {
    author: 'Jesse Elias',
    rating: 5,
    date: 'a year ago',
    text: 'Came by for an open mat and had a blast! Great facilities, great people and great vibes.',
    truncated: false,
  },
]

/** Top 3 reviews for the homepage — curated for maximum impact. */
export const FEATURED_REVIEWS: Review[] = (
  [
    REVIEWS.find(r => r.author === 'Phong Nguyen'),
    REVIEWS.find(r => r.author === 'Noah Murphy'),
    REVIEWS.find(r => r.author === 'Luis Sierra'),
  ] as Array<Review | undefined>
).filter((r): r is Review => r !== undefined)
