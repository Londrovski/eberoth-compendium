<template>
  <span
    class="realtime-dot"
    :class="bucket"
    :title="label"
  >
    <span class="dot" />
    <span class="text">Live</span>
  </span>
</template>

<script setup>
import { useRealtimeHealth } from 'src/composables/useRealtimeHealth';
const { bucket, label } = useRealtimeHealth();
</script>

<style scoped>
.realtime-dot {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  letter-spacing: 0.04em;
  color: var(--text-dim);
  cursor: default;
  user-select: none;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #555;
  box-shadow: 0 0 0 0 rgba(0,0,0,0);
  transition: background 0.2s ease, box-shadow 0.2s ease;
}
.text {
  font-variant: small-caps;
}
.realtime-dot.green .dot {
  background: #5fbf6a;
  box-shadow: 0 0 8px rgba(95,191,106,0.55);
}
.realtime-dot.amber .dot {
  background: #d8a93a;
  box-shadow: 0 0 8px rgba(216,169,58,0.55);
}
.realtime-dot.red .dot {
  background: #c34d4d;
  box-shadow: 0 0 8px rgba(195,77,77,0.6);
  animation: pulse-red 1.4s infinite;
}
@keyframes pulse-red {
  0%, 100% { transform: scale(1);   opacity: 1; }
  50%      { transform: scale(1.2); opacity: 0.6; }
}
</style>
