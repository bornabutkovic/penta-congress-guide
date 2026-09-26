# Enrich flight option cards

## Confirmed data shape
The current `flight_data.options` rows contain top-level `airline`, `bags_included`, `cabin_bags_included`, `total_duration_minutes`, and `price_total`. Each `outbound` / optional `inbound` leg contains `origin`, `destination`, `departure_at`, `arrival_at`, `duration_minutes`, `stops`, `layover_summary`, and a `segments` array whose rows contain `flight_number`, `from`, `to`, `departure_at`, `arrival_at`, and `duration`.

## Changes
- Extend only the normalized flight option data in `src/routes/ponude_.$id.tsx`; hotel, transfer, fee, selection, price-check, and booking behavior remain unchanged.
- Add a flight-only detail renderer inside the existing option card for both selectable and read-only states.
- Show airline and segment flight numbers first, then compact outbound and return blocks with route, localized departure/arrival date-times, leg duration, stop count, and `layover_summary` when present.
- Show checked and carry-on baggage quantities as a compact final row, using the confirmed `bags_included` and `cabin_bags_included` fields.
- Preserve the current radio input, selected styling, recommendation marker, and total price placement.

## Verification
- Run `bunx tsgo --noEmit`.
- Check the latest automatic build result for new errors.
