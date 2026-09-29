"use client";

import { CoverUpload } from "@/components/discovery/cover-upload";
import { MediaUpload } from "@/components/discovery/media-upload";
import { BodyEditor } from "@/components/discovery/body-editor";
import { inputCls, labelCls } from "@/components/discovery/publish-constants";
import type { PublicationType } from "@/lib/discovery/types";

type Props = {
  pubType: PublicationType;
  summary: string; setSummary: (v: string) => void;
  body: string; setBody: (v: string) => void;
  coverUrl: string | null; setCoverUrl: (v: string | null) => void;
  mediaUrl: string | null; setMediaUrl: (v: string | null) => void;
  subtitle: string; setSubtitle: (v: string) => void;
  genre: string; setGenre: (v: string) => void;
  releaseDate: string; setReleaseDate: (v: string) => void;
  streamLinks: string; setStreamLinks: (v: string) => void;
  duration: string; setDuration: (v: string) => void;
  videoUrl: string; setVideoUrl: (v: string) => void;
  chapters: string; setChapters: (v: string) => void;
  authors: string; setAuthors: (v: string) => void;
  year: string; setYear: (v: string) => void;
  doi: string; setDoi: (v: string) => void;
  price: string; setPrice: (v: string) => void;
  currency: string; setCurrency: (v: string) => void;
  buyLink: string; setBuyLink: (v: string) => void;
  eventDate: string; setEventDate: (v: string) => void;
  eventTime: string; setEventTime: (v: string) => void;
  venue: string; setVenue: (v: string) => void;
  ticketLink: string; setTicketLink: (v: string) => void;
  capacity: string; setCapacity: (v: string) => void;
  oppType: string; setOppType: (v: string) => void;
  deadline: string; setDeadline: (v: string) => void;
  requirements: string; setRequirements: (v: string) => void;
  applyLink: string; setApplyLink: (v: string) => void;
  location: string; setLocation: (v: string) => void;
  caption: string; setCaption: (v: string) => void;
  altText: string; setAltText: (v: string) => void;
};

export function TypeSpecificFields(p: Props) {
  const { pubType } = p;

  if (pubType === "article") {
    return (
      <>
        <label className="block">
          <span className={labelCls}>Subtitle</span>
          <input value={p.subtitle} onChange={(e) => p.setSubtitle(e.target.value)} className={inputCls} placeholder="Optional hook under the title" />
        </label>
        <div>
          <p className={labelCls}>Cover</p>
          <div className="mt-1.5"><CoverUpload value={p.coverUrl} onChange={p.setCoverUrl} /></div>
        </div>
        <label className="block">
          <span className={labelCls}>Summary</span>
          <textarea value={p.summary} onChange={(e) => p.setSummary(e.target.value)} rows={2} className={`${inputCls} h-auto py-2.5`} placeholder="One or two lines that make people open it" />
        </label>
        <div>
          <p className={labelCls}>Body</p>
          <div className="mt-1.5"><BodyEditor value={p.body} onChange={p.setBody} /></div>
        </div>
      </>
    );
  }

  if (pubType === "music") {
    return (
      <>
        <div>
          <p className={labelCls}>Cover art</p>
          <div className="mt-1.5"><CoverUpload value={p.coverUrl} onChange={p.setCoverUrl} /></div>
        </div>
        <div>
          <p className={labelCls}>Audio file</p>
          <div className="mt-1.5">
            <MediaUpload value={p.mediaUrl} onChange={p.setMediaUrl} accept="audio/*" label="Upload track" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelCls}>Genre</span>
            <input value={p.genre} onChange={(e) => p.setGenre(e.target.value)} className={inputCls} placeholder="Afrobeats, Alt-R&B" />
          </label>
          <label className="block">
            <span className={labelCls}>Release date</span>
            <input type="date" value={p.releaseDate} onChange={(e) => p.setReleaseDate(e.target.value)} className={inputCls} />
          </label>
        </div>
        <label className="block">
          <span className={labelCls}>Duration</span>
          <input value={p.duration} onChange={(e) => p.setDuration(e.target.value)} className={inputCls} placeholder="3:24" />
        </label>
        <label className="block">
          <span className={labelCls}>Streaming links</span>
          <textarea value={p.streamLinks} onChange={(e) => p.setStreamLinks(e.target.value)} rows={2} className={`${inputCls} h-auto py-2.5`} placeholder="Spotify, Apple Music — one per line" />
        </label>
        <label className="block">
          <span className={labelCls}>About this release</span>
          <textarea value={p.summary} onChange={(e) => p.setSummary(e.target.value)} rows={2} className={`${inputCls} h-auto py-2.5`} placeholder="What this song is for" />
        </label>
        <div>
          <p className={labelCls}>Lyrics / notes</p>
          <div className="mt-1.5"><BodyEditor value={p.body} onChange={p.setBody} /></div>
        </div>
      </>
    );
  }

  if (pubType === "video") {
    return (
      <>
        <div>
          <p className={labelCls}>Thumbnail</p>
          <div className="mt-1.5"><CoverUpload value={p.coverUrl} onChange={p.setCoverUrl} /></div>
        </div>
        <div>
          <p className={labelCls}>Video file</p>
          <div className="mt-1.5">
            <MediaUpload value={p.mediaUrl} onChange={p.setMediaUrl} accept="video/*" label="Upload video" />
          </div>
        </div>
        <label className="block">
          <span className={labelCls}>Or video URL</span>
          <input value={p.videoUrl} onChange={(e) => p.setVideoUrl(e.target.value)} className={inputCls} placeholder="https://..." />
        </label>
        <label className="block">
          <span className={labelCls}>Duration</span>
          <input value={p.duration} onChange={(e) => p.setDuration(e.target.value)} className={inputCls} placeholder="12:40" />
        </label>
        <label className="block">
          <span className={labelCls}>Description</span>
          <textarea value={p.summary} onChange={(e) => p.setSummary(e.target.value)} rows={3} className={`${inputCls} h-auto py-2.5`} placeholder="What viewers should expect" />
        </label>
        <label className="block">
          <span className={labelCls}>Chapters</span>
          <textarea value={p.chapters} onChange={(e) => p.setChapters(e.target.value)} rows={3} className={`${inputCls} h-auto py-2.5`} placeholder={"0:00 Intro\n1:20 Main\n8:00 Close"} />
        </label>
      </>
    );
  }

  if (pubType === "research") {
    return (
      <>
        <div>
          <p className={labelCls}>Cover / figure</p>
          <div className="mt-1.5"><CoverUpload value={p.coverUrl} onChange={p.setCoverUrl} /></div>
        </div>
        <label className="block">
          <span className={labelCls}>Abstract</span>
          <textarea value={p.summary} onChange={(e) => p.setSummary(e.target.value)} rows={3} className={`${inputCls} h-auto py-2.5`} placeholder="Key finding in a few sentences" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelCls}>Authors</span>
            <input value={p.authors} onChange={(e) => p.setAuthors(e.target.value)} className={inputCls} placeholder="Name, Name" />
          </label>
          <label className="block">
            <span className={labelCls}>Year</span>
            <input value={p.year} onChange={(e) => p.setYear(e.target.value)} className={inputCls} placeholder="2026" />
          </label>
        </div>
        <label className="block">
          <span className={labelCls}>DOI / paper link</span>
          <input value={p.doi} onChange={(e) => p.setDoi(e.target.value)} className={inputCls} placeholder="https://... or 10...." />
        </label>
        <div>
          <p className={labelCls}>Full text or notes</p>
          <div className="mt-1.5"><BodyEditor value={p.body} onChange={p.setBody} /></div>
        </div>
        <div>
          <p className={labelCls}>Attach PDF</p>
          <div className="mt-1.5">
            <MediaUpload value={p.mediaUrl} onChange={p.setMediaUrl} accept=".pdf,.doc,.docx" label="Upload paper" />
          </div>
        </div>
      </>
    );
  }

  if (pubType === "product") {
    return (
      <>
        <div>
          <p className={labelCls}>Product image</p>
          <div className="mt-1.5"><CoverUpload value={p.coverUrl} onChange={p.setCoverUrl} /></div>
        </div>
        <label className="block">
          <span className={labelCls}>Short pitch</span>
          <textarea value={p.summary} onChange={(e) => p.setSummary(e.target.value)} rows={2} className={`${inputCls} h-auto py-2.5`} placeholder="What it is and who it is for" />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="col-span-1 block">
            <span className={labelCls}>Currency</span>
            <select value={p.currency} onChange={(e) => p.setCurrency(e.target.value)} className={inputCls}>
              <option value="USD">USD</option>
              <option value="NGN">NGN</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
          <label className="col-span-2 block">
            <span className={labelCls}>Price / amount</span>
            <input value={p.price} onChange={(e) => p.setPrice(e.target.value)} className={inputCls} placeholder="29 or Contact" />
          </label>
        </div>
        <label className="block">
          <span className={labelCls}>Buy / checkout link</span>
          <input value={p.buyLink} onChange={(e) => p.setBuyLink(e.target.value)} className={inputCls} placeholder="https://..." />
        </label>
        <div>
          <p className={labelCls}>Details</p>
          <div className="mt-1.5"><BodyEditor value={p.body} onChange={p.setBody} /></div>
        </div>
      </>
    );
  }

  if (pubType === "event") {
    return (
      <>
        <div>
          <p className={labelCls}>Event cover</p>
          <div className="mt-1.5"><CoverUpload value={p.coverUrl} onChange={p.setCoverUrl} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={labelCls}>Date</span>
            <input type="date" value={p.eventDate} onChange={(e) => p.setEventDate(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className={labelCls}>Time</span>
            <input type="time" value={p.eventTime} onChange={(e) => p.setEventTime(e.target.value)} className={inputCls} />
          </label>
        </div>
        <label className="block">
          <span className={labelCls}>Venue</span>
          <input value={p.venue} onChange={(e) => p.setVenue(e.target.value)} className={inputCls} placeholder="Hall name or Zoom" />
        </label>
        <label className="block">
          <span className={labelCls}>City / location</span>
          <input value={p.location} onChange={(e) => p.setLocation(e.target.value)} className={inputCls} placeholder="Lagos · Online" />
        </label>
        <label className="block">
          <span className={labelCls}>Ticket / RSVP link</span>
          <input value={p.ticketLink} onChange={(e) => p.setTicketLink(e.target.value)} className={inputCls} placeholder="https://..." />
        </label>
        <label className="block">
          <span className={labelCls}>Capacity</span>
          <input value={p.capacity} onChange={(e) => p.setCapacity(e.target.value)} className={inputCls} placeholder="120" />
        </label>
        <label className="block">
          <span className={labelCls}>About the event</span>
          <textarea value={p.summary} onChange={(e) => p.setSummary(e.target.value)} rows={3} className={`${inputCls} h-auto py-2.5`} placeholder="Who should come and why" />
        </label>
        <div>
          <p className={labelCls}>Full description</p>
          <div className="mt-1.5"><BodyEditor value={p.body} onChange={p.setBody} /></div>
        </div>
      </>
    );
  }

  if (pubType === "file") {
    return (
      <>
        <div>
          <p className={labelCls}>File</p>
          <div className="mt-1.5">
            <MediaUpload value={p.mediaUrl} onChange={p.setMediaUrl} accept="*/*" label="Upload file" />
          </div>
        </div>
        <div>
          <p className={labelCls}>Preview image</p>
          <div className="mt-1.5"><CoverUpload value={p.coverUrl} onChange={p.setCoverUrl} /></div>
        </div>
        <label className="block">
          <span className={labelCls}>What this is</span>
          <textarea value={p.summary} onChange={(e) => p.setSummary(e.target.value)} rows={3} className={`${inputCls} h-auto py-2.5`} placeholder="Why someone should download it" />
        </label>
      </>
    );
  }

  if (pubType === "image") {
    return (
      <>
        <div>
          <p className={labelCls}>Image</p>
          <div className="mt-1.5"><CoverUpload value={p.coverUrl} onChange={p.setCoverUrl} /></div>
        </div>
        <label className="block">
          <span className={labelCls}>Caption</span>
          <textarea
            value={p.caption}
            onChange={(e) => {
              p.setCaption(e.target.value);
              p.setSummary(e.target.value);
            }}
            rows={2}
            className={`${inputCls} h-auto py-2.5`}
            placeholder="Context under the image"
          />
        </label>
        <label className="block">
          <span className={labelCls}>Alt text</span>
          <input value={p.altText} onChange={(e) => p.setAltText(e.target.value)} className={inputCls} placeholder="Describe for accessibility" />
        </label>
      </>
    );
  }

  if (pubType === "announcement") {
    return (
      <>
        <label className="block">
          <span className={labelCls}>Announcement</span>
          <textarea value={p.summary} onChange={(e) => p.setSummary(e.target.value)} rows={4} className={`${inputCls} h-auto py-2.5`} placeholder="Keep it short — this travels with your identity" />
        </label>
        <div>
          <p className={labelCls}>Optional image</p>
          <div className="mt-1.5"><CoverUpload value={p.coverUrl} onChange={p.setCoverUrl} /></div>
        </div>
        <div>
          <p className={labelCls}>More detail</p>
          <div className="mt-1.5"><BodyEditor value={p.body} onChange={p.setBody} /></div>
        </div>
      </>
    );
  }

  if (pubType === "opportunity") {
    return (
      <>
        <label className="block">
          <span className={labelCls}>Type</span>
          <select value={p.oppType} onChange={(e) => p.setOppType(e.target.value)} className={inputCls}>
            <option value="role">Role / job</option>
            <option value="partnership">Partnership</option>
            <option value="investment">Investment</option>
            <option value="open_call">Open call</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>Summary</span>
          <textarea value={p.summary} onChange={(e) => p.setSummary(e.target.value)} rows={2} className={`${inputCls} h-auto py-2.5`} placeholder="Who this is for in one line" />
        </label>
        <label className="block">
          <span className={labelCls}>Location</span>
          <input value={p.location} onChange={(e) => p.setLocation(e.target.value)} className={inputCls} placeholder="Remote · Lagos · Global" />
        </label>
        <label className="block">
          <span className={labelCls}>Deadline</span>
          <input type="date" value={p.deadline} onChange={(e) => p.setDeadline(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Requirements</span>
          <textarea value={p.requirements} onChange={(e) => p.setRequirements(e.target.value)} rows={3} className={`${inputCls} h-auto py-2.5`} placeholder="What you need from applicants" />
        </label>
        <label className="block">
          <span className={labelCls}>Apply / contact link</span>
          <input value={p.applyLink} onChange={(e) => p.setApplyLink(e.target.value)} className={inputCls} placeholder="https://... or email" />
        </label>
        <div>
          <p className={labelCls}>Full brief</p>
          <div className="mt-1.5"><BodyEditor value={p.body} onChange={p.setBody} /></div>
        </div>
      </>
    );
  }

  return (
    <>
      <label className="block">
        <span className={labelCls}>Summary</span>
        <input value={p.summary} onChange={(e) => p.setSummary(e.target.value)} className={inputCls} />
      </label>
      <div>
        <p className={labelCls}>Body</p>
        <div className="mt-1.5"><BodyEditor value={p.body} onChange={p.setBody} /></div>
      </div>
      <div>
        <p className={labelCls}>Cover</p>
        <div className="mt-1.5"><CoverUpload value={p.coverUrl} onChange={p.setCoverUrl} /></div>
      </div>
    </>
  );
}
