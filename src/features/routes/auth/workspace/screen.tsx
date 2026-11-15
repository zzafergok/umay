import { getCurrentLocale } from '@/lib/i18n/server-locale';
import { getAuthWorkspaceCopy } from './i18n';
import { WorkspaceBoardView } from './workspace-board-view';

export async function AuthWorkspaceScreen() {
  const locale = await getCurrentLocale();
  const copy = getAuthWorkspaceCopy(locale);

  return (
    <WorkspaceBoardView lanes={copy.lanes} placeholder={copy.placeholder} />
  );
}
