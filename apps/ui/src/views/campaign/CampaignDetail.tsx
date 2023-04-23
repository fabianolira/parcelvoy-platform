import Button from '../../ui/Button'
import PageContent from '../../ui/PageContent'
import { Outlet } from 'react-router-dom'
import { NavigationTabs } from '../../ui/Tabs'
import { useContext, useEffect, useState } from 'react'
import { CampaignContext, LocaleContext, LocaleSelection, ProjectContext } from '../../contexts'
import { languageName } from '../../utils'
import { Campaign, LocaleOption, Template } from '../../types'
import api from '../../api'
import { CampaignTag } from './Campaigns'
import LaunchCampaign from './LaunchCampaign'
import { ForbiddenIcon, RestartIcon, SendIcon } from '../../ui/icons'

export const localeOption = (locale: string): LocaleOption => {
    const language = languageName(locale)
    return {
        key: locale,
        label: language ? `${language} (${locale})` : locale,
    }
}

export const locales = (templates: Template[]) => templates?.map(item => localeOption(item.locale))

const localeState = (templates: Template[]) => {
    const allLocales = locales(templates)
    return {
        currentLocale: allLocales[0],
        allLocales: locales(templates ?? []),
    }
}

export const createLocale = async (newLocale: string, campaign: Campaign): Promise<Template> => {
    // TODO: Get base locale from user preferences
    const baseLocale = 'en'
    const template = campaign.templates.find(template => template.locale === baseLocale) ?? campaign.templates[0]
    return await api.templates.create(campaign.project_id, {
        campaign_id: campaign.id,
        type: campaign.channel,
        locale: newLocale,
        data: template?.data,
    })
}

export default function CampaignDetail() {
    const [project] = useContext(ProjectContext)
    const [campaign, setCampaign] = useContext(CampaignContext)
    const { name, templates, state } = campaign
    const [locale, setLocale] = useState<LocaleSelection>(localeState(templates ?? []))
    useEffect(() => {
        setLocale(localeState(templates ?? []))
    }, [campaign.id])
    const [isLaunchOpen, setIsLaunchOpen] = useState(false)

    const handleAbort = async () => {
        const value = await api.campaigns.update(project.id, campaign.id, { state: 'aborted' })
        setCampaign(value)
    }

    const tabs = [
        {
            key: 'details',
            to: '',
            children: 'Details',
        },
        {
            key: 'design',
            to: 'design',
            children: 'Design',
        },
        {
            key: 'preview',
            to: 'preview',
            children: 'Preview',
        },
        {
            key: 'delivery',
            to: 'delivery',
            children: 'Delivery',
        },
    ]

    const action = {
        draft: (
            <Button
                icon={<SendIcon />}
                onClick={() => setIsLaunchOpen(true)}
            >Launch Campaign</Button>
        ),
        aborted: (
            <Button
                icon={<RestartIcon />}
                onClick={() => setIsLaunchOpen(true)}
            >Restart Campaign</Button>
        ),
        pending: <></>,
        scheduled: (
            <>
                <Button
                    icon={<SendIcon />}
                    onClick={() => setIsLaunchOpen(true)}
                >Change Schedule</Button>
                <Button
                    icon={<ForbiddenIcon />}
                    onClick={async () => await handleAbort()}
                >Abort Campaign</Button>
            </>
        ),
        running: (
            <Button
                icon={<ForbiddenIcon />}
                onClick={async () => await handleAbort()}
            >Abort Campaign</Button>
        ),
        finished: <></>,
    }

    return (
        <PageContent
            title={name}
            desc={state !== 'draft' && <CampaignTag state={campaign.state} />}
            actions={action[state]}>
            <NavigationTabs tabs={tabs} />
            <LocaleContext.Provider value={[locale, setLocale]}>
                <Outlet />
            </LocaleContext.Provider>

            <LaunchCampaign open={isLaunchOpen} onClose={setIsLaunchOpen} />
        </PageContent>
    )
}
