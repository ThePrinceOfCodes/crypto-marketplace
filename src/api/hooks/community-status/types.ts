export interface ICommunityStatus {
    uuid: string;
    country : string,
    name: string,
    execution_date: string,
    last_month_total_members:number,
    last_month_new_members: number;
    this_month_new_members:number,
    this_month_growth_rate:number,
    total_member_growth_rate:number,
    total_members: number,
    last_month_participation_amount:number,
    this_month_participation_amount:number,
    this_month_cash_participation_amount: number,
    this_month_participant_growth_rate:number,
    new_members_rate:number,
    participation_amount_rate:number,
    created_by: string,
    createdAt: string,
    action_by: string,
    action_date: string
}