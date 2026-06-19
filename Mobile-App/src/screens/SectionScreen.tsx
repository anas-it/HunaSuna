import type { ApiUser } from "../types/api";
import type { AppSection } from "../types/navigation";
import { ContactsScreen } from "./ContactsScreen";
import { DeletedRecordsScreen } from "./DeletedRecordsScreen";
import { NewRecordScreen } from "./NewRecordScreen";
import { RecordsScreen } from "./RecordsScreen";
import { SearchScreen } from "./SearchScreen";
import { SettingsScreen } from "./SettingsScreen";

type Props = {
  highlightedRecordId?: string | null;
  onBack: () => void;
  onLogout: () => void;
  onRecordSaved: (recordId: string) => void;
  onUserChange: (user: ApiUser) => void;
  initialSearchQuery?: string;
  section: AppSection;
  token: string;
  user: ApiUser;
};

export function SectionScreen({
  highlightedRecordId,
  initialSearchQuery = "",
  onBack,
  onLogout,
  onRecordSaved,
  onUserChange,
  section,
  token,
  user
}: Props) {
  if (section === "new-record") {
    return <NewRecordScreen onBack={onBack} onRecordSaved={onRecordSaved} token={token} />;
  }

  if (section === "contacts") {
    return <ContactsScreen onBack={onBack} token={token} />;
  }

  if (section === "records") {
    return <RecordsScreen highlightedRecordId={highlightedRecordId} onBack={onBack} token={token} />;
  }

  if (section === "search") {
    return <SearchScreen initialQuery={initialSearchQuery} onBack={onBack} token={token} />;
  }

  if (section === "deleted") {
    return <DeletedRecordsScreen onBack={onBack} token={token} />;
  }

  return <SettingsScreen onBack={onBack} onLogout={onLogout} onUserChange={onUserChange} token={token} user={user} />;
}
