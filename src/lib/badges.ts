export type BadgeType =
  | 'first_post'
  | 'respect_10'
  | 'respect_100'
  | 'follower_10'
  | 'follower_50'
  | 'streak_7'
  | 'streak_30'
  | 'post_10'
  | 'post_100'

export const BADGE_META: Record<BadgeType, { icon: string; label: string; desc: string; color: string }> = {
  first_post:   { icon: '🌱', label: '初投稿',        desc: '初めての投稿を行った',             color: 'text-green-600 dark:text-green-400'  },
  respect_10:   { icon: '👊', label: 'リスペクト10',  desc: '合計10リスペクト獲得',             color: 'text-orange-600 dark:text-orange-400' },
  respect_100:  { icon: '🔥', label: 'リスペクト100', desc: '合計100リスペクト獲得',            color: 'text-red-600 dark:text-red-400'      },
  follower_10:  { icon: '👥', label: 'フォロワー10',  desc: '10人にフォローされた',             color: 'text-blue-600 dark:text-blue-400'    },
  follower_50:  { icon: '⭐', label: 'フォロワー50',  desc: '50人にフォローされた',             color: 'text-yellow-600 dark:text-yellow-400' },
  streak_7:     { icon: '📅', label: '7日連続',       desc: '7日連続で投稿した',               color: 'text-indigo-600 dark:text-indigo-400' },
  streak_30:    { icon: '🏆', label: '30日連続',      desc: '30日連続で投稿した',              color: 'text-purple-600 dark:text-purple-400' },
  post_10:      { icon: '📝', label: '10投稿',        desc: '累計10件投稿した',                color: 'text-teal-600 dark:text-teal-400'    },
  post_100:     { icon: '💎', label: '100投稿',       desc: '累計100件投稿した',               color: 'text-cyan-600 dark:text-cyan-400'    },
}

export function calcEarnedBadges({
  postCount,
  totalRespects,
  followerCount,
  streakCurrent,
}: {
  postCount: number
  totalRespects: number
  followerCount: number
  streakCurrent: number
}): BadgeType[] {
  const earned: BadgeType[] = []
  if (postCount >= 1)   earned.push('first_post')
  if (postCount >= 10)  earned.push('post_10')
  if (postCount >= 100) earned.push('post_100')
  if (totalRespects >= 10)  earned.push('respect_10')
  if (totalRespects >= 100) earned.push('respect_100')
  if (followerCount >= 10)  earned.push('follower_10')
  if (followerCount >= 50)  earned.push('follower_50')
  if (streakCurrent >= 7)   earned.push('streak_7')
  if (streakCurrent >= 30)  earned.push('streak_30')
  return earned
}
