export function generateInitials(firstName: string, lastName: string): string {
  const first = firstName?.[0]?.toUpperCase() ?? '';
  const last = lastName?.[0]?.toUpperCase() ?? '';
  return last ? `${first}${last}` : first;
}

export function generateAvatarColor(name: string): string {
  const colors = [
    '#FF7A00',
    '#FF5EB3',
    '#6E52FF',
    '#9327FF',
    '#00BEE8',
    '#1FD7C1',
    '#FF745E',
    '#FFA35E',
  ];
  return colors[name.charCodeAt(0) % colors.length];
}
