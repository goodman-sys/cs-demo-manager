import React from 'react';
import { createBrowserRouter, Navigate, Route } from 'react-router';
import { createRoutesFromElements } from 'react-router';
import { Root } from './bootstrap/root';
import { Matches } from 'csdm/ui/matches/matches';
import { MatchLoader } from 'csdm/ui/match/match-loader';
import { MatchOverview } from 'csdm/ui/match/overview/match-overview';
import { Rounds } from 'csdm/ui/match/rounds/overview/rounds';
import { MatchHeatmap } from 'csdm/ui/match/heatmap/match-heatmap';
import { Viewer2DLoader } from 'csdm/ui/match/viewer-2d/viewer-2d-loader';
import { MatchPlayersLoader } from 'csdm/ui/match/players/match-players-loader';
import { Weapons } from 'csdm/ui/match/weapons/weapons';
import { ChatMessages } from 'csdm/ui/match/chat-messages/chat-messages';
import { Economy } from 'csdm/ui/match/economy/economy';
import { Players } from 'csdm/ui/players/players';
import { Player } from 'csdm/ui/player/player';
import { PlayerOverview } from 'csdm/ui/player/overview/player-overview';
import { PlayerCharts } from 'csdm/ui/player/charts/player-charts';
import { PlayerMaps } from 'csdm/ui/player/maps/player-maps';
import { PlayerHeatmap } from 'csdm/ui/player/heatmap/player-heatmap';
import { PlayerRank } from 'csdm/ui/player/rank/player-rank';
import { PlayerMatchesTable } from 'csdm/ui/player/matches/player-matches-table';
import { Teams } from 'csdm/ui/teams/teams';
import { Team } from 'csdm/ui/team/team';
import { TeamOverview } from 'csdm/ui/team/overview/team-overview';
import { TeamMaps } from 'csdm/ui/team/maps/team-maps';
import { TeamHeatmap } from 'csdm/ui/team/heatmap/team-heatmap';
import { TeamPerformance } from 'csdm/ui/team/performance/team-performance';
import { TeamMatchesTable } from 'csdm/ui/team/matches/team-matches-table';
import { Demos } from 'csdm/ui/demos/demos';
import { Search } from 'csdm/ui/search/search';
import { BanStats } from 'csdm/ui/ban/stats/ban-stats';
import { ErrorBoundary } from 'csdm/ui/error-boundary';
import { RoutePath } from 'csdm/ui/routes-paths';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />} errorElement={<ErrorBoundary />}>
      <Route index={true} element={<Navigate to={RoutePath.Matches} replace={true} />} />
      <Route path={RoutePath.Matches} element={<Matches />} />
      <Route path={`${RoutePath.Matches}/:checksum`} element={<MatchLoader />}>
        <Route index={true} element={<MatchOverview />} />
        <Route path={RoutePath.MatchRounds} element={<Rounds />} />
        <Route path={RoutePath.MatchHeatmap} element={<MatchHeatmap />} />
        <Route path={RoutePath.Match2dViewer} element={<Viewer2DLoader />} />
        <Route path={RoutePath.MatchPlayers} element={<MatchPlayersLoader />} />
        <Route path={RoutePath.MatchWeapons} element={<Weapons />} />
        <Route path={RoutePath.MatchChat} element={<ChatMessages />} />
        <Route path={RoutePath.MatchEconomy} element={<Economy />} />
      </Route>
      <Route path={RoutePath.Players} element={<Players />} />
      <Route path={`${RoutePath.Players}/:steamId`} element={<Player />}>
        <Route index={true} element={<PlayerOverview />} />
        <Route path={RoutePath.PlayerCharts} element={<PlayerCharts />} />
        <Route path={RoutePath.PlayerMaps} element={<PlayerMaps />} />
        <Route path={RoutePath.PlayerHeatmap} element={<PlayerHeatmap />} />
        <Route path={RoutePath.PlayerRank} element={<PlayerRank />} />
        <Route path={RoutePath.PlayerMatches} element={<PlayerMatchesTable />} />
      </Route>
      <Route path={RoutePath.Teams} element={<Teams />} />
      <Route path={`${RoutePath.Teams}/:name`} element={<Team />}>
        <Route index={true} element={<TeamOverview />} />
        <Route path={RoutePath.TeamMaps} element={<TeamMaps />} />
        <Route path={RoutePath.TeamHeatmap} element={<TeamHeatmap />} />
        <Route path={RoutePath.TeamPerformance} element={<TeamPerformance />} />
        <Route path={RoutePath.TeamMatches} element={<TeamMatchesTable />} />
      </Route>
      <Route path={RoutePath.Demos} element={<Demos />} />
      <Route path={RoutePath.Search} element={<Search />} />
      <Route path={RoutePath.Ban} element={<BanStats />} />
    </Route>,
  ),
);
