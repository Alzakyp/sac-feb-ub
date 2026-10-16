import type { ImgHTMLAttributes } from 'react';

const files: Record<string, string> = {
  alert: 'alert.svg', arrow: 'arrow-right.svg', 'arrow-right': 'arrow-right.svg', check: 'check-circle.svg', 'check-circle': 'check-circle.svg', chat: 'chat.svg', close: 'close.svg', copy: 'copy.svg', docs: 'docs.svg', download: 'download.svg', eye: 'eye.svg', folder: 'folder.svg', group: 'group.svg', info: 'info.svg', 'mail-line': 'mail-line.svg', pencil: 'pencil.svg', plus: 'plus.svg', 'plug-in': 'plug-in.svg', time: 'time.svg', 'user-line': 'user-line.svg',
};

export function Icon({ name, className = '', ...props }: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & { name: string }) {
  return <img src={`/tailadmin/icons/${files[name] || 'info.svg'}`} alt="" aria-hidden="true" className={`inline-block h-4 w-4 object-contain ${className}`} {...props} />;
}
