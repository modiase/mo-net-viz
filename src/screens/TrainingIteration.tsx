import * as AP from 'fp-ts/Apply';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import * as RR from 'fp-ts/ReadonlyRecord';
import type { Dataset, Group } from 'h5wasm';
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { colors } from 'theme';

const ACTIVATIONS_KEY = 'activations';
const WEIGHTS_KEY = 'weights';
const BIASES_KEY = 'biases';
const UPDATES_WEIGHTS_KEY = 'updates/weights';
const UPDATES_BIASES_KEY = 'updates/biases';

const HISTOGRAM_GROUPS = [WEIGHTS_KEY, BIASES_KEY, ACTIVATIONS_KEY, UPDATES_WEIGHTS_KEY, UPDATES_BIASES_KEY] as const;

const HIST_COUNT_KEY = 'histogram_values';
const HIST_BINS_KEY = 'histogram_bins';

const Histogram = ({ bins, counts, title }: { bins: Dataset; counts: Dataset; title: string }) => {
  const binsWithCounts = pipe(
    Array.from(counts.value as BigInt64Array),
    RA.map(Number),
    RA.zip(pipe(Array.from(bins.value as BigInt64Array), RA.map(Number)))
  );

  const data = {
    labels: binsWithCounts.map(([bin, _]) => bin.toFixed(2)),
    datasets: [
      {
        label: 'Count',
        data: binsWithCounts.map(([_, count]) => count),
        backgroundColor: colors.secondary.translucent,
        borderColor: colors.secondary.solid,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

const getHistogramValues = (layer: string, group: Group): O.Option<readonly [Dataset, Dataset]> => {
  return pipe(
    O.fromNullable(group.get(layer) as Group | null),
    O.chain((layerGroup) =>
      AP.sequenceS(O.Apply)({
        counts: O.fromNullable(layerGroup.get(HIST_COUNT_KEY) as Dataset | null),
        bins: O.fromNullable(layerGroup.get(HIST_BINS_KEY) as Dataset | null),
      })
    ),
    O.map(({ counts, bins }) => [counts, bins] as const)
  );
};

const TrainingIteration = ({ iteration }: { iteration: Group }) => {
  const attributeToLayerToData = useMemo(() => {
    return pipe(
      HISTOGRAM_GROUPS,
      RA.map((key) => [key, O.fromNullable(iteration.get(key) as Group | null)] as const),
      RR.fromEntries,
      RR.compact,
      RR.map((group) =>
        pipe(
          group.keys(),
          RA.map((layer) => [layer, getHistogramValues(layer, group)] as const),
          RR.fromEntries,
          RR.compact
        )
      )
    );
  }, [iteration]);

  return (
    <>
      {pipe(
        attributeToLayerToData,
        RR.mapWithIndex((attribute, layerToData) =>
          pipe(
            layerToData,
            RR.mapWithIndex((layer, [bins, counts]) => (
              <Histogram key={`${attribute}-${layer}`} bins={bins} counts={counts} title={`${layer} - ${attribute}`} />
            )),
            RR.toReadonlyArray,
            RA.map(([_, value]) => value),
            (histograms) => (
              <div className="grid grid-cols-3 gap-4 mx-auto">
                {pipe(
                  histograms,
                  RA.map((h) => <div className="w-full">{h}</div>)
                )}
              </div>
            )
          )
        ),
        RR.toReadonlyArray,
        RA.map(([_, value]) => value)
      )}
    </>
  );
};

export default TrainingIteration;
