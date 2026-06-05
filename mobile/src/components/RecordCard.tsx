import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import type { RecordListItem } from "../api/hunasuna";
import { colors, spacing } from "../styles/theme";
import { formatDateTime, recordPerson, recordPhone } from "../utils/format";

type Props = {
  actions?: ReactNode;
  highlighted?: boolean;
  record: RecordListItem;
};

export function RecordCard({ actions, highlighted = false, record }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const senderName = recordPerson(record, "sender");
  const receiverName = recordPerson(record, "receiver");

  return (
    <View style={[styles.wrapper, highlighted ? styles.wrapperHighlighted : null]}>
      <Pressable
        delayLongPress={1500}
        onLongPress={() => setDetailsOpen(true)}
        style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
      >
        <View style={styles.routeRow}>
          <PersonBlock label="От" name={senderName} />
          <View style={styles.arrowCircle}>
            <Feather color={colors.primary} name="arrow-right" size={17} />
          </View>
          <PersonBlock label="Кому" name={receiverName} />
        </View>

        <View style={styles.amountRow}>
          <Text numberOfLines={1} style={styles.amount}>
            {record.amount} {record.currency}
          </Text>
          <View style={styles.ratePill}>
            <Text numberOfLines={1} style={styles.rateText}>курс {record.rate}</Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Feather color={colors.muted} name="clock" size={15} />
          <Text style={styles.date}>{formatDateTime(record.createdAt)}</Text>
        </View>

        {record.restoreUntil ? <Text style={styles.restore}>Можно восстановить до {formatDateTime(record.restoreUntil)}</Text> : null}
      </Pressable>

      {actions ? <View style={styles.actions}>{actions}</View> : null}

      <RecordDetailsModal onClose={() => setDetailsOpen(false)} record={record} visible={detailsOpen} />
    </View>
  );
}

function PersonBlock({ label, name }: { label: string; name: string }) {
  return (
    <View style={styles.personBlock}>
      <Text style={styles.personLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.personName}>
        {name}
      </Text>
    </View>
  );
}

function RecordDetailsModal({
  onClose,
  record,
  visible
}: {
  onClose: () => void;
  record: RecordListItem;
  visible: boolean;
}) {
  const senderName = recordPerson(record, "sender");
  const receiverName = recordPerson(record, "receiver");
  const senderPhone = recordPhone(record, "sender") || "не указан";
  const receiverPhone = recordPhone(record, "receiver") || "не указан";

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalOverlay}>
        <Pressable onPress={onClose} style={styles.modalBackdrop} />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Подробная запись</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Feather color={colors.muted} name="x" size={20} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalAmountBox}>
              <Text style={styles.modalAmount}>{record.amount} {record.currency}</Text>
              <Text style={styles.modalRate}>Курс: {record.rate}</Text>
            </View>

            <DetailRow icon="user" label="От кого" value={senderName} />
            <DetailRow icon="phone" label="Телефон отправителя" value={senderPhone} />
            <DetailRow icon="user-check" label="Кому" value={receiverName} />
            <DetailRow icon="phone-call" label="Телефон получателя" value={receiverPhone} />
            <DetailRow icon="calendar" label="Дата и время" value={formatDateTime(record.createdAt)} />
            <DetailRow icon="map-pin" label="Часовой пояс" value={record.timezone || "не указан"} />

            {record.restoreUntil ? (
              <DetailRow icon="rotate-ccw" label="Восстановление" value={`до ${formatDateTime(record.restoreUntil)}`} />
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({
  icon,
  label,
  value
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Feather color={colors.primary} name={icon} size={18} />
      </View>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text selectable style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  wrapperHighlighted: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 2
  },
  card: {
    gap: spacing.sm,
    padding: spacing.md
  },
  cardPressed: {
    backgroundColor: "#F1F8F9"
  },
  routeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  personBlock: {
    flex: 1,
    minWidth: 0
  },
  personLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16
  },
  personName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22
  },
  arrowCircle: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#BFE3E6",
    borderRadius: 15,
    borderWidth: 1,
    backgroundColor: "#EEF8F9"
  },
  amountRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  amount: {
    color: colors.text,
    flex: 1,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 26
  },
  ratePill: {
    borderColor: "#BFE3E6",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#EEF8F9",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  rateText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800"
  },
  dateRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  date: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600"
  },
  restore: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  },
  actions: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "flex-end",
    padding: spacing.sm
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.42)"
  },
  modalCard: {
    width: "100%",
    maxHeight: "82%",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  modalHeader: {
    minHeight: 56,
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: spacing.md,
    paddingRight: spacing.sm
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8
  },
  modalContent: {
    gap: spacing.sm,
    padding: spacing.md
  },
  modalAmountBox: {
    borderColor: "#BFE3E6",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#EEF8F9",
    padding: spacing.md
  },
  modalAmount: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30
  },
  modalRate: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2
  },
  detailRow: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm
  },
  detailIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#EEF8F9"
  },
  detailText: {
    flex: 1,
    minWidth: 0
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16
  },
  detailValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22
  }
});
