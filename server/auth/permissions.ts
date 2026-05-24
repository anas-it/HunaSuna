export function assertOwnResource(resourceUserId: string, currentUserId: string) {
  if (resourceUserId !== currentUserId) {
    throw new Error("Access denied");
  }
}
