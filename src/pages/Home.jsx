import { columns } from '@/components/table/columns';
import useSWRImmutable from 'swr/immutable';
import DataTable from '@/components/table/DataTable';
import { getStats } from '@/lib/requests';
import ChannelDetails from '@/components/ChannelDetails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useTable from '@/lib/hooks/useTable';
import ColumnSelector from '@/components/table/ColumnSelector';
import { useEffect, useState } from 'react';
import TopStats from '@/components/TopStats';
import Analysis from './Analysis';
import AnalysisInput from '@/components/AnalysisInput';

export default function Home({ channelId, value, setValue }) {
  const { data, isLoading, error } = useSWRImmutable(
    `/channel-details/${channelId}`,
    getStats
  );
  console.log(error);
  // const isLoading = false;
  const channelDetails = !isLoading &&
    data && {
      channelTitle: data.channelTitle,
      channelDescription: data.channelDescription,
      thumbnail: data.thumbnail,
      viewCount: data.viewCount,
      subscriberCount: data.subscriberCount,
      videoCount: data.videoCount,
      customUrl: data.customUrl,
      maxViews: data.maxViews,
      maxComments: data.maxComments,
      maxLikes: data.maxLikes,
    };
  const [videoTitle, setVideoTitle] = useState('');
  const [videoId, setVideoId] = useState('');

  useEffect(() => {
    if (!isLoading && data) {
      setVideoId(data.videoDetails[0].id);
      setVideoTitle(data.videoDetails[0].title);
    }
  }, [isLoading, data]);

  const onSearching = (vId, vTitle) => {
    console.log(vId, vTitle);
    setVideoId(vId);
    setVideoTitle(vTitle);
    setValue('sentiment');
  };
  console.log(videoId, videoTitle);
  const { table } = useTable({
    data: data?.videoDetails || [],
    columns,
    onSearching,
  });
  return (
    <div className='max-w-[1200px] mx-auto sm:p-5 p-3'>
      {!isLoading && !error && data ? (
        <>
          <ChannelDetails details={channelDetails} />
          <div>
            <Tabs value={value} onValueChange={value => setValue(value)}>
              <div className='flex flex-col justify-between md:flex-row gap-4 items-stretch mb-4 mt-8'>
                <TabsList>
                  <TabsTrigger value='table'>Statistics</TabsTrigger>
                  <TabsTrigger value='top'>Top Charts</TabsTrigger>
                  <TabsTrigger value='sentiment'>Sentiments</TabsTrigger>
                </TabsList>
                {value === 'table' && <ColumnSelector table={table} />}
                {value === 'sentiment' && (
                  <AnalysisInput
                    data={data.videoDetails}
                    search={onSearching}
                  />
                )}
              </div>
              <TabsContent value='table'>
                <DataTable
                  columns={columns}
                  table={table}
                  isLoading={isLoading}
                />
              </TabsContent>
              <TabsContent value='top'>
                <div>
                  <TopStats
                    details={channelDetails}
                    chartData={data.videoDetails.slice(0, 80)}
                  />
                </div>
              </TabsContent>
              <TabsContent value='sentiment'>
                <Analysis
                  data={data.videoDetails}
                  videoTitle={videoTitle}
                  videoId={videoId}
                />
              </TabsContent>
            </Tabs>
          </div>
        </>
      ) : (
        <div className='flex items-center justify-center mt-20'>
          {error && error.message}
          {isLoading && !error && 'Analyzing channel...'}
          {!isLoading && !error && 'Look for a channel'}
        </div>
      )}
    </div>
  );
}
