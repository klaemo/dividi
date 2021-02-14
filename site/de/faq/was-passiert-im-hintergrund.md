---
title: Was passiert im Hintergrund?
order: 6
---

Der unterliegende Algorithmus basiert auf
<a href="https://dl.acm.org/doi/abs/10.1145/2556195.2556213" rel="noopener" target="_blank">Fennel</a >, einer Heuristik für
<a href="https://en.wikipedia.org/wiki/Graph_partition" rel="noopener" target="_blank">Graph Partitioning</a >. Um das Ergebnis zu verbessern, wird Fennel mehrfach mit zufällig gewählter Reihenfolge der Schüler ausgeführt. Daher ist die eingegebene Reihenfolge der Schüler auch unwichtig für das Gesamtergebnis. Es kann darüber hinaus dazu kommen, dass eine wiederholte Berechnung zu verschiedenen Ergebnissen führt. Wer sich den Code anschauen möchte oder mitarbeiten möchte, kann dies auf
<a href="https://github.com/klaemo/dividi" target="_blank" rel="noopener">Github</a >
tun.
