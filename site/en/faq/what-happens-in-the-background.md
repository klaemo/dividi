---
title: What happens in the background?
order: 7
---

The underlying algorithm is based on <a href="https://dl.acm.org/doi/abs/10.1145/2556195.2556213" rel="noopener" target="_blank">Fennel</a>, a heuristic for <a href="https://en.wikipedia.org/wiki/Graph_partition" rel="noopener" target="_blank">graph partitioning</a>. To improve the result, Fennel is run multiple times with a randomly chosen order of students. Therefore, the input order of the students does not affect the overall result. Furthermore, a repeated calculation may lead to different results. Anyone who would like to look at the code or contribute can do so on <a href="https://github.com/klaemo/dividi" target="_blank" rel="noopener">Github</a >.
